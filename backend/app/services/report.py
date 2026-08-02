from collections import OrderedDict
from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.schemas.report import TurnoverByCounterparty, TurnoverByPeriod


def _apply_date_filters(query, date_from: date | None, date_to: date | None):
    if date_from is not None:
        query = query.filter(Invoice.issue_date >= date_from)
    if date_to is not None:
        query = query.filter(Invoice.issue_date <= date_to)
    return query


def turnover_by_period(
    db: Session,
    company_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[TurnoverByPeriod]:
    query = _apply_date_filters(
        db.query(Invoice).filter(Invoice.company_id == company_id), date_from, date_to
    )
    invoices = query.order_by(Invoice.issue_date).all()

    totals: "OrderedDict[str, dict]" = OrderedDict()
    for invoice in invoices:
        period = f"{invoice.issue_date.year:04d}-{invoice.issue_date.month:02d}"
        bucket = totals.setdefault(period, {"count": 0, "total": Decimal("0.00")})
        bucket["count"] += 1
        bucket["total"] += invoice.total

    return [
        TurnoverByPeriod(period=period, invoice_count=data["count"], total=data["total"])
        for period, data in totals.items()
    ]


def turnover_by_counterparty(
    db: Session,
    company_id: int,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[TurnoverByCounterparty]:
    query = (
        db.query(
            Invoice.counterparty_id,
            func.max(Invoice.counterparty_name),
            func.count(Invoice.id),
            func.sum(Invoice.total),
        )
        .filter(Invoice.company_id == company_id)
        .group_by(Invoice.counterparty_id)
    )
    query = _apply_date_filters(query, date_from, date_to)
    rows = query.all()

    results = [
        TurnoverByCounterparty(
            counterparty_id=counterparty_id,
            counterparty_name=counterparty_name,
            invoice_count=count,
            total=total,
        )
        for counterparty_id, counterparty_name, count, total in rows
    ]
    return sorted(results, key=lambda r: r.counterparty_name)
