from decimal import Decimal

from pydantic import BaseModel


class TurnoverByPeriod(BaseModel):
    period: str
    invoice_count: int
    total: Decimal


class TurnoverByCounterparty(BaseModel):
    counterparty_id: int
    counterparty_name: str
    invoice_count: int
    total: Decimal
