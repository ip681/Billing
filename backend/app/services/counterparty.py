from sqlalchemy.orm import Session

from app.models.counterparty import Counterparty
from app.schemas.counterparty import CounterpartyCreate, CounterpartyUpdate


def list_counterparties(db: Session, company_id: int) -> list[Counterparty]:
    return (
        db.query(Counterparty)
        .filter(Counterparty.company_id == company_id)
        .order_by(Counterparty.name)
        .all()
    )


def get_counterparty(
    db: Session, company_id: int, counterparty_id: int
) -> Counterparty | None:
    return (
        db.query(Counterparty)
        .filter(Counterparty.id == counterparty_id, Counterparty.company_id == company_id)
        .first()
    )


def create_counterparty(
    db: Session, company_id: int, data: CounterpartyCreate
) -> Counterparty:
    counterparty = Counterparty(company_id=company_id, **data.model_dump())
    db.add(counterparty)
    db.commit()
    db.refresh(counterparty)
    return counterparty


def update_counterparty(
    db: Session, counterparty: Counterparty, data: CounterpartyUpdate
) -> Counterparty:
    for field, value in data.model_dump().items():
        setattr(counterparty, field, value)
    db.commit()
    db.refresh(counterparty)
    return counterparty


def delete_counterparty(db: Session, counterparty: Counterparty) -> None:
    db.delete(counterparty)
    db.commit()
