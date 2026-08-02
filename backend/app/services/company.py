from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.storage import UPLOAD_DIR

ALLOWED_LOGO_EXTENSIONS = {".png", ".jpg", ".jpeg"}


def get_company(db: Session, company_id: int) -> Company:
    company = db.get(Company, company_id)
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


def create_company(db: Session, user: User, data: CompanyCreate) -> Company:
    if user.company_id is not None:
        raise HTTPException(status_code=400, detail="Вече имате фирма.")
    company = Company(**data.model_dump())
    db.add(company)
    db.flush()
    user.company_id = company.id
    user.role = "owner"
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company_id: int, data: CompanyUpdate) -> Company:
    company = get_company(db, company_id)
    for field, value in data.model_dump().items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company


def _delete_logo_file(filename: str | None) -> None:
    if not filename:
        return
    path = UPLOAD_DIR / filename
    if path.exists():
        path.unlink()


def save_logo(db: Session, company_id: int, filename_hint: str, content: bytes) -> Company:
    ext = "".join(filename_hint.rsplit(".", 1)[-1:]).lower()
    ext = f".{ext}" if ext else ""
    if ext not in ALLOWED_LOGO_EXTENSIONS:
        raise ValueError("Разрешени формати: PNG, JPG, SVG.")

    company = get_company(db, company_id)
    _delete_logo_file(company.logo_filename)

    stored_filename = f"company-logo-{company.id}{ext}"
    (UPLOAD_DIR / stored_filename).write_bytes(content)

    company.logo_filename = stored_filename
    db.commit()
    db.refresh(company)
    return company


def delete_logo(db: Session, company_id: int) -> Company:
    company = get_company(db, company_id)
    _delete_logo_file(company.logo_filename)
    company.logo_filename = None
    db.commit()
    db.refresh(company)
    return company


def list_members(db: Session, company_id: int) -> list[User]:
    return db.query(User).filter(User.company_id == company_id).order_by(User.email).all()


def add_member(db: Session, company_id: int, email: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Няма регистриран акаунт с този email.")
    if user.company_id is not None:
        raise HTTPException(status_code=400, detail="Този акаунт вече принадлежи на фирма.")
    user.company_id = company_id
    user.role = "member"
    db.commit()
    db.refresh(user)
    return user


def remove_member(db: Session, company_id: int, user_id: int) -> None:
    member = db.get(User, user_id)
    if member is None or member.company_id != company_id:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.role == "owner":
        raise HTTPException(status_code=400, detail="Собственикът не може да бъде премахнат.")
    member.company_id = None
    member.role = None
    db.commit()


def leave_company(db: Session, user: User) -> None:
    if user.role == "owner":
        raise HTTPException(
            status_code=400, detail="Собственикът не може да напусне фирмата."
        )
    user.company_id = None
    user.role = None
    db.commit()
