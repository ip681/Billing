from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import require_company_id
from app.db import get_db
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services import product as service

router = APIRouter(prefix="/api/products", tags=["products"])


def _get_or_404(db: Session, company_id: int, product_id: int):
    product = service.get_product(db, company_id, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("", response_model=list[ProductRead])
def list_products(
    company_id: int = Depends(require_company_id), db: Session = Depends(get_db)
):
    return service.list_products(db, company_id)


@router.post("", response_model=ProductRead, status_code=201)
def create_product(
    data: ProductCreate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return service.create_product(db, company_id, data)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    return _get_or_404(db, company_id, product_id)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    data: ProductUpdate,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    product = _get_or_404(db, company_id, product_id)
    return service.update_product(db, product, data)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    company_id: int = Depends(require_company_id),
    db: Session = Depends(get_db),
):
    product = _get_or_404(db, company_id, product_id)
    service.delete_product(db, product)
