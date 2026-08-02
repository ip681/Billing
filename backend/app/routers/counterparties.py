from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import require_company_id
from app.db import get_db
from app.schemas.counterparty import (
    CounterpartyCreate,
    CounterpartyRead,
    CounterpartyUpdate,
)
from app.services import counterparty as service

router = APIRouter(prefix="/api/counterparties", tags=["counterparties"])


def _get_or_404(db: Session, company_id: int, counterparty_id: int):
    counterparty = service.get_counterparty(db, company_id, counterparty_id)
    if counterparty is None:
        raise HTTPException(status_code=404, detail="Counterparty not found")
    return counterparty


@router.get("", response_model=list[CounterpartyRead])
def list_counterparties(
    company_id: int = Depends(require_company_id), db: Session = Depends(get_db)
):
    return service.list_counterparties(db, company_id)


@router.post("", response_model=CounterpartyRead, status_code=201)
def create_counterparty(
    data: CounterpartyCreate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.create_counterparty(db, company_id, data)


@router.get("/{counterparty_id}", response_model=CounterpartyRead)
def get_counterparty(
    counterparty_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return _get_or_404(db, company_id, counterparty_id)


@router.put("/{counterparty_id}", response_model=CounterpartyRead)
def update_counterparty(
    counterparty_id: int,
    data: CounterpartyUpdate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    counterparty = _get_or_404(db, company_id, counterparty_id)
    return service.update_counterparty(db, counterparty, data)


@router.delete("/{counterparty_id}", status_code=204)
def delete_counterparty(
    counterparty_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    counterparty = _get_or_404(db, company_id, counterparty_id)
    service.delete_counterparty(db, counterparty)
