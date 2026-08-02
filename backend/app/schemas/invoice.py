from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InvoiceItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)


class InvoiceCreate(BaseModel):
    counterparty_id: int
    issue_date: date
    items: list[InvoiceItemCreate] = Field(min_length=1)


class InvoiceItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    product_unit: str
    product_unit_price: Decimal
    product_vat_rate: Decimal | None
    quantity: Decimal
    line_subtotal: Decimal
    line_vat: Decimal
    line_total: Decimal


class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    issue_date: date
    counterparty_id: int
    counterparty_name: str
    counterparty_eik: str
    counterparty_vat_number: str | None
    counterparty_address: str
    counterparty_mol: str | None
    company_name: str
    company_eik: str
    company_address: str
    company_is_vat_registered: bool
    company_vat_exempt_reason: str | None
    subtotal: Decimal
    vat_amount: Decimal
    total: Decimal
    status: str
    items: list[InvoiceItemRead]
    created_at: datetime
    updated_at: datetime


class InvoiceListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    issue_date: date
    counterparty_name: str
    total: Decimal
    status: str
