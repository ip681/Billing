from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import (
    auth,
    company,
    counterparties,
    health,
    invoices,
    products,
    reports,
)
from app.storage import UPLOAD_DIR

app = FastAPI(title="Billing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(company.router)
app.include_router(counterparties.router)
app.include_router(products.router)
app.include_router(invoices.router)
app.include_router(reports.router)
