from uuid import UUID
from pydantic import EmailStr, Field
from .application_schema import ApplicationSchema  # your base

class UserSignUp(ApplicationSchema):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)

class UserRead(ApplicationSchema):
    id: UUID
    full_name: str
    email: EmailStr
    settings: dict

class UserSignIn(ApplicationSchema):
    email: EmailStr
    password: str

class JwtToken(ApplicationSchema):
    token: str
    type: str = "bearer"

class UserWithJwt(UserRead):
    jwt: JwtToken

class UserSettingsUpdate(ApplicationSchema):
    llm_model: str
    llm_provider: str
