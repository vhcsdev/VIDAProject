from pydantic import BaseModel, EmailStr, Field


class UserCreateSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponseSchema(BaseModel):
    id: int
    username: str
    email: EmailStr


class VoiceRegistrationSchema(BaseModel):
    user_id: int
    voice: str = Field(
        ..., description="Base64 encoded audio data for voice registration"
    )


class VoiceLoginSchema(BaseModel):
    email: EmailStr
    voice: str = Field(
        ..., description="Base64 encoded audio data for voice authentication"
    )


class LoginResponseSchema(BaseModel):
    success: bool
    user_id: int
    username: str
    message: str
