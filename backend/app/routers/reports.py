from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_company_id
from app.db import get_db
from app.schemas.report import TurnoverByCounterparty, TurnoverByPeriod
from app.services import report as service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/turnover-by-period", response_model=list[TurnoverByPeriod])
def turnover_by_period(
    date_from: date | None = None,
    date_to: date | None = None,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.turnover_by_period(db, company_id, date_from, date_to)


@router.get("/turnover-by-counterparty", response_model=list[TurnoverByCounterparty])
def turnover_by_counterparty(
    date_from: date | None = None,
    date_to: date | None = None,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.turnover_by_counterparty(db, company_id, date_from, date_to)
