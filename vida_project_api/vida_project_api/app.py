import base64
import hashlib

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import select

from vida_project_api.database import get_session
from vida_project_api.models import User
from vida_project_api.schemas import (
    LoginResponseSchema,
    UserCreateSchema,
    UserResponseSchema,
    VoiceLoginSchema,
    VoiceRegistrationSchema,
)
from vida_project_api.voiceRecording import verify_voice_against_stored

MIN_AUDIO_SIZE_BYTES = 1000

app = FastAPI(
    title="VIDA Voice Authentication API",
    description="API para autenticação por voz",
    version="1.0.0",
)


def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


@app.get("/")
def hello_world():
    return {"message": "VIDA Voice Authentication API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "vida-voice-auth"}


@app.post("/users", status_code=201, response_model=UserResponseSchema)
def create_user(user: UserCreateSchema, session=Depends(get_session)):
    existing_user = session.scalar(
        select(User).where(
            (User.username == user.username) | (User.email == user.email)
        )
    )
    if existing_user:
        if existing_user.username == user.username:
            raise HTTPException(
                status_code=409, detail="Username already exists"
            )
        elif existing_user.email == user.email:
            raise HTTPException(status_code=409, detail="Email already exists")

    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        voice=None,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return UserResponseSchema(
        id=new_user.id, username=new_user.username, email=new_user.email
    )


@app.post("/register-voice", status_code=200)
def register_voice(
    voice_data: VoiceRegistrationSchema, session=Depends(get_session)
):
    user = session.scalar(select(User).where(User.id == voice_data.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.voice is not None:
        raise HTTPException(
            status_code=400,
            detail="User already has voice registered. Use update "
            "endpoint instead.",
        )

    try:
        decoded_audio = base64.b64decode(voice_data.voice)

        if len(decoded_audio) < MIN_AUDIO_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail="Audio file too small. Please record at least "
                "3-5 seconds.",
            )

    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid base64 voice data: {str(e)}"
        )

    try:
        is_valid = verify_voice_against_stored(
            voice_data.voice, None, test_mode=True
        )
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail="Audio format not supported. Please use WAV, MP3, "
                "or other common formats.",
            )
    except Exception:
        pass

    user.voice = voice_data.voice
    session.commit()

    return {
        "message": "Voice registered successfully",
        "user_id": user.id,
        "username": user.username,
    }


@app.post("/login", status_code=200, response_model=LoginResponseSchema)
def voice_login(login_data: VoiceLoginSchema, session=Depends(get_session)):
    user = session.scalar(select(User).where(User.email == login_data.email))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.voice is None:
        raise HTTPException(
            status_code=400,
            detail="User has no voice registered. Please register voice first.",
        )

    try:
        base64.b64decode(login_data.voice)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 voice data")

    try:
        is_authenticated = verify_voice_against_stored(
            login_data.voice, user.voice, test_mode=False
        )

        if is_authenticated:
            return LoginResponseSchema(
                success=True,
                user_id=user.id,
                username=user.username,
                message="Voice authentication successful",
            )
        else:
            return LoginResponseSchema(
                success=False,
                user_id=user.id,
                username=user.username,
                message="Voice authentication failed - voice does not match",
            )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Voice verification error: {str(e)}"
        )


@app.get("/users/{user_id}", response_model=UserResponseSchema)
def get_user(user_id: int, session=Depends(get_session)):
    user = session.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponseSchema(
        id=user.id, username=user.username, email=user.email
    )


@app.delete("/users/{user_id}/voice", status_code=200)
def delete_voice(user_id: int, session=Depends(get_session)):
    user = session.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.voice is None:
        raise HTTPException(
            status_code=404, detail="User has no voice registered"
        )

    user.voice = None
    session.commit()

    return {"message": "Voice deleted successfully"}


@app.put("/users/{user_id}/voice", status_code=200)
def update_voice(
    user_id: int,
    voice_data: VoiceRegistrationSchema,
    session=Depends(get_session),
):
    user = session.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        base64.b64decode(voice_data.voice)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 voice data")

    user.voice = voice_data.voice
    session.commit()

    return {
        "message": "Voice updated successfully",
        "user_id": user.id,
        "username": user.username,
    }
