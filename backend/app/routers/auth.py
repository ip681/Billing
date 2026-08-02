from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, verify_password
from app.db import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, MeResponse, RegisterRequest
from app.services import company as company_service
from app.services import user as user_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if user_service.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Вече има акаунт с този email.")

    user = user_service.create_user(db, data)
    if data.company is not None:
        company_service.create_company(db, user, data.company)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=user)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, data.email)
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Грешен email или парола.")

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user=user)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = None
    if current_user.company_id is not None:
        company = company_service.get_company(db, current_user.company_id)
    return MeResponse(user=current_user, company=company)
