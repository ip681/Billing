from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_company_id
from app.db import get_db
from app.models.user import User
from app.schemas.company import (
    AddMemberRequest,
    CompanyCreate,
    CompanyMemberRead,
    CompanyRead,
    CompanyUpdate,
)
from app.services import company as service

router = APIRouter(prefix="/api/company", tags=["company"])

MAX_LOGO_SIZE = 2 * 1024 * 1024  # 2MB


def _require_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Само собственикът може да прави това.")
    return current_user


@router.get("", response_model=CompanyRead)
def read_company(company_id: int = Depends(require_company_id), db: Session = Depends(get_db)):
    return service.get_company(db, company_id)


@router.post("", response_model=CompanyRead, status_code=201)
def create_company(
    data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.create_company(db, current_user, data)


@router.put("", response_model=CompanyRead)
def update_company(
    data: CompanyUpdate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.update_company(db, company_id, data)


@router.post("/logo", response_model=CompanyRead)
async def upload_logo(
    file: UploadFile,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if len(content) > MAX_LOGO_SIZE:
        raise HTTPException(status_code=400, detail="Файлът е твърде голям (макс. 2MB).")
    try:
        return service.save_logo(db, company_id, file.filename or "", content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/logo", response_model=CompanyRead)
def remove_logo(company_id: int = Depends(require_company_id), db: Session = Depends(get_db)):
    return service.delete_logo(db, company_id)


@router.get("/members", response_model=list[CompanyMemberRead])
def list_members(company_id: int = Depends(require_company_id), db: Session = Depends(get_db)):
    return service.list_members(db, company_id)


@router.post("/members", response_model=CompanyMemberRead, status_code=201)
def add_member(
    data: AddMemberRequest,
    owner: User = Depends(_require_owner),
    db: Session = Depends(get_db),
):
    return service.add_member(db, owner.company_id, data.email)


@router.delete("/members/{user_id}", status_code=204)
def remove_member(
    user_id: int,
    owner: User = Depends(_require_owner),
    db: Session = Depends(get_db),
):
    service.remove_member(db, owner.company_id, user_id)


@router.post("/members/leave", status_code=204)
def leave_company(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    service.leave_company(db, current_user)
