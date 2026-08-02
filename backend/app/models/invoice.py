from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Invoice(Base):
    __tablename__ = "invoices"
    __table_args__ = (
        UniqueConstraint("company_id", "invoice_number", name="uq_invoice_company_number"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    company_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("companies.id"), nullable=False
    )
    invoice_number: Mapped[str] = mapped_column(String, nullable=False)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)

    counterparty_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("counterparties.id"), nullable=False
    )
    counterparty_name: Mapped[str] = mapped_column(String, nullable=False)
    counterparty_eik: Mapped[str] = mapped_column(String, nullable=False)
    counterparty_vat_number: Mapped[str | None] = mapped_column(String, nullable=True)
    counterparty_address: Mapped[str] = mapped_column(String, nullable=False)
    counterparty_mol: Mapped[str | None] = mapped_column(String, nullable=True)

    company_name: Mapped[str] = mapped_column(String, nullable=False)
    company_eik: Mapped[str] = mapped_column(String, nullable=False)
    company_address: Mapped[str] = mapped_column(String, nullable=False)
    company_is_vat_registered: Mapped[bool] = mapped_column(Boolean, nullable=False)
    company_vat_exempt_reason: Mapped[str | None] = mapped_column(String, nullable=True)

    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    vat_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[str] = mapped_column(String, nullable=False, default="issued")

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["InvoiceItem"]] = relationship(
        back_populates="invoice", order_by="InvoiceItem.id"
    )


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("invoices.id"), nullable=False
    )
    product_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("products.id"), nullable=True
    )

    product_name: Mapped[str] = mapped_column(String, nullable=False)
    product_unit: Mapped[str] = mapped_column(String, nullable=False)
    product_unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    product_vat_rate: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)

    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    line_subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    line_vat: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    invoice: Mapped[Invoice] = relationship(back_populates="items")
