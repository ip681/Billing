from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def list_products(db: Session, company_id: int) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.company_id == company_id)
        .order_by(Product.name)
        .all()
    )


def get_product(db: Session, company_id: int, product_id: int) -> Product | None:
    return (
        db.query(Product)
        .filter(Product.id == product_id, Product.company_id == company_id)
        .first()
    )


def create_product(db: Session, company_id: int, data: ProductCreate) -> Product:
    product = Product(company_id=company_id, **data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    for field, value in data.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
