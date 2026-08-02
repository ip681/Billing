from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.auth import require_company_id
from app.db import get_db
from app.schemas.invoice import InvoiceCreate, InvoiceListItem, InvoiceRead
from app.services import company as company_service
from app.services import invoice as service
from app.services.invoice_pdf import build_invoice_pdf
from app.storage import UPLOAD_DIR

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


@router.get("", response_model=list[InvoiceListItem])
def list_invoices(
    counterparty_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    status: str | None = None,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.list_invoices(
        db, company_id, counterparty_id, date_from, date_to, status
    )


@router.post("", response_model=InvoiceRead, status_code=201)
def create_invoice(
    data: InvoiceCreate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.create_invoice(db, company_id, data)


@router.get("/{invoice_id}", response_model=InvoiceRead)
def get_invoice(
    invoice_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    invoice = service.get_invoice(db, company_id, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(
    invoice_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    invoice = service.get_invoice(db, company_id, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")

    company = company_service.get_company(db, company_id)
    logo_path = str(UPLOAD_DIR / company.logo_filename) if company.logo_filename else None

    pdf_bytes = build_invoice_pdf(invoice, logo_path)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{invoice.invoice_number}.pdf"'
        },
    )
