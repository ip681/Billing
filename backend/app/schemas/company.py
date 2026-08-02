from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator


class CompanyCreate(BaseModel):
    name: str
    eik: str
    address: str
    is_vat_registered: bool
    vat_exempt_reason: str | None = None
    invoice_number_prefix: str | None = None

    @model_validator(mode="after")
    def check_vat_exempt_reason(self) -> "CompanyCreate":
        if not self.is_vat_registered and not self.vat_exempt_reason:
            raise ValueError(
                "vat_exempt_reason е задължително, ако фирмата не е регистрирана по ДДС"
            )
        return self


class CompanyUpdate(CompanyCreate):
    pass


class CompanyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    eik: str
    address: str
    is_vat_registered: bool
    vat_exempt_reason: str | None
    invoice_number_prefix: str | None
    logo_filename: str | None
    next_invoice_number: int
    created_at: datetime
    updated_at: datetime


class CompanyMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str | None
    role: str | None


class AddMemberRequest(BaseModel):
    email: str
