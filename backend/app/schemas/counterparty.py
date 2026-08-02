from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CounterpartyCreate(BaseModel):
    name: str
    eik: str
    vat_number: str | None = None
    address: str
    mol: str | None = None
    email: str | None = None
    phone: str | None = None


class CounterpartyUpdate(CounterpartyCreate):
    pass


class CounterpartyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    eik: str
    vat_number: str | None
    address: str
    mol: str | None
    email: str | None
    phone: str | None
    created_at: datetime
    updated_at: datetime
