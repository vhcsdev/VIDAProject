import base64
import hashlib
import io

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
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
from vida_project_api.voiceRecording import verify_voice_against_stored, verify_voice_against_stored_with_score

MIN_AUDIO_SIZE_BYTES = 1000

app = FastAPI(
    title="VIDA Voice Authentication API",
    description="API para autenticação por voz",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# Additional endpoints for frontend compatibility

@app.post("/voice/register", status_code=200)
def register_voice_multipart(
    email: str = Form(...),
    audio_file: UploadFile = File(...),
    session=Depends(get_session)
):
    """Register voice using multipart form data (compatible with frontend)"""
    # Find user by email
    user = session.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.voice is not None:
        raise HTTPException(
            status_code=400,
            detail="User already has voice registered."
        )

    try:
        # Read audio file and encode to base64
        audio_content = audio_file.file.read()
        
        if len(audio_content) < MIN_AUDIO_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail="Audio file too small. Please record at least 3-5 seconds.",
            )
        
        voice_b64 = base64.b64encode(audio_content).decode('utf-8')
        
        # Verify the voice data is valid
        is_valid = verify_voice_against_stored(
            voice_b64, None, test_mode=True
        )
        
        user.voice = voice_b64
        session.commit()

        return {
            "message": "Voice registered successfully",
            "user_id": user.id,
            "username": user.username,
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Voice registration failed: {str(e)}"
        )


@app.post("/voice/verify", status_code=200)
def verify_voice_multipart(
    email: str = Form(...),
    audio_file: UploadFile = File(...),
    session=Depends(get_session)
):
    """Verify voice using multipart form data (compatible with frontend)"""
    print(f"DEBUG: Voice verification request for email: {email}")
    
    # Find user by email
    user = session.scalar(select(User).where(User.email == email))
    if not user:
        print(f"DEBUG: User not found: {email}")
        raise HTTPException(status_code=404, detail="User not found")

    if user.voice is None:
        print(f"DEBUG: User {email} has no voice registered")
        raise HTTPException(
            status_code=400,
            detail="User has no voice registered. Please register voice first.",
        )

    try:
        # Read audio file and encode to base64
        audio_content = audio_file.file.read()
        voice_b64 = base64.b64encode(audio_content).decode('utf-8')
        
        print(f"DEBUG: Audio file size: {len(audio_content)} bytes")
        print(f"DEBUG: Calling verify_voice_against_stored_with_score")
        
        # Verify voice against stored voice
        is_authenticated, confidence_score = verify_voice_against_stored_with_score(
            voice_b64, user.voice, test_mode=False
        )

        print(f"DEBUG: Verification result: authenticated={is_authenticated}, score={confidence_score}")

        result = {
            "verified": is_authenticated,
            "score": confidence_score,  # Real confidence score from SpeechBrain
            "user_id": user.id,
            "username": user.username,
            "message": "Voice verification successful" if is_authenticated else "Voice verification failed"
        }
        
        print(f"DEBUG: Returning result: {result}")
        return result
        
    except Exception as e:
        print(f"DEBUG: Exception in voice verification: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Voice verification failed: {str(e)}"
        )
