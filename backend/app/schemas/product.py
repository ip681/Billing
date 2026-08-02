from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    unit: str
    unit_price: Decimal


class ProductUpdate(ProductCreate):
    pass


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    unit: str
    unit_price: Decimal
    created_at: datetime
    updated_at: datetime
