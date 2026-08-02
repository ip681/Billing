from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.counterparty import Counterparty
from app.models.invoice import Invoice, InvoiceItem
from app.models.product import Product
from app.schemas.invoice import InvoiceCreate
from app.services.company import get_company

CENTS = Decimal("0.01")
STANDARD_VAT_RATE = Decimal("20.00")


def _money(value: Decimal) -> Decimal:
    return value.quantize(CENTS, rounding=ROUND_HALF_UP)


def list_invoices(
    db: Session,
    company_id: int,
    counterparty_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    status: str | None = None,
) -> list[Invoice]:
    query = db.query(Invoice).filter(Invoice.company_id == company_id)
    if counterparty_id is not None:
        query = query.filter(Invoice.counterparty_id == counterparty_id)
    if date_from is not None:
        query = query.filter(Invoice.issue_date >= date_from)
    if date_to is not None:
        query = query.filter(Invoice.issue_date <= date_to)
    if status is not None:
        query = query.filter(Invoice.status == status)
    return query.order_by(Invoice.id.desc()).all()


def get_invoice(db: Session, company_id: int, invoice_id: int) -> Invoice | None:
    return (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.company_id == company_id)
        .first()
    )


def create_invoice(db: Session, company_id: int, data: InvoiceCreate) -> Invoice:
    settings = get_company(db, company_id)
    if not settings.name or not settings.eik:
        raise HTTPException(
            status_code=400,
            detail="Настройте данните на фирмата (име, ЕИК), преди да издавате фактури.",
        )

    counterparty = (
        db.query(Counterparty)
        .filter(Counterparty.id == data.counterparty_id, Counterparty.company_id == company_id)
        .first()
    )
    if counterparty is None:
        raise HTTPException(status_code=404, detail="Counterparty not found")

    items: list[InvoiceItem] = []
    subtotal = Decimal("0.00")
    vat_amount = Decimal("0.00")

    for item_data in data.items:
        product = (
            db.query(Product)
            .filter(Product.id == item_data.product_id, Product.company_id == company_id)
            .first()
        )
        if product is None:
            raise HTTPException(
                status_code=404, detail=f"Product {item_data.product_id} not found"
            )

        line_subtotal = _money(item_data.quantity * product.unit_price)
        effective_vat_rate = STANDARD_VAT_RATE if settings.is_vat_registered else None
        line_vat = (
            _money(line_subtotal * effective_vat_rate / Decimal("100"))
            if effective_vat_rate
            else Decimal("0.00")
        )
        line_total = line_subtotal + line_vat

        items.append(
            InvoiceItem(
                product_id=product.id,
                product_name=product.name,
                product_unit=product.unit,
                product_unit_price=product.unit_price,
                product_vat_rate=effective_vat_rate,
                quantity=item_data.quantity,
                line_subtotal=line_subtotal,
                line_vat=line_vat,
                line_total=line_total,
            )
        )
        subtotal += line_subtotal
        vat_amount += line_vat

    invoice_number = f"{settings.next_invoice_number:010d}"

    invoice = Invoice(
        company_id=company_id,
        invoice_number=invoice_number,
        issue_date=data.issue_date,
        counterparty_id=counterparty.id,
        counterparty_name=counterparty.name,
        counterparty_eik=counterparty.eik,
        counterparty_vat_number=counterparty.vat_number,
        counterparty_address=counterparty.address,
        counterparty_mol=counterparty.mol,
        company_name=settings.name,
        company_eik=settings.eik,
        company_address=settings.address,
        company_is_vat_registered=settings.is_vat_registered,
        company_vat_exempt_reason=settings.vat_exempt_reason,
        subtotal=subtotal,
        vat_amount=vat_amount,
        total=subtotal + vat_amount,
        items=items,
    )
    settings.next_invoice_number += 1

    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
