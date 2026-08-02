from pydantic import BaseModel, EmailStr, Field

from app.schemas.company import CompanyCreate, CompanyRead
from app.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str | None = None
    company: CompanyCreate | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: UserRead


class MeResponse(BaseModel):
    user: UserRead
    company: CompanyRead | None
