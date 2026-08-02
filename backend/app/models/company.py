from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    eik: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    is_vat_registered: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    vat_exempt_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    logo_filename: Mapped[str | None] = mapped_column(String, nullable=True)
    next_invoice_number: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )
