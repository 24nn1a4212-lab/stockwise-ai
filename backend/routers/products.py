"""
Product Management Router for StockWise AI.
CRUD endpoints, search, filtering, and stock adjustment.
"""
import uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status

from database import db_manager
from models.schemas import Product, ProductCreate, ProductUpdate, ProductStockAdjustment, MessageResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=dict)
def get_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name, SKU, or category"),
    status: Optional[str] = Query(None, description="Filter by status: Critical, Low Stock, Healthy")
):
    all_products = db_manager.get_products(category=category, search=search)
    if status and status.lower() != "all":
        all_products = [p for p in all_products if p.get("status", "").lower() == status.lower()]

    return {
        "total": len(all_products),
        "products": all_products
    }


@router.get("/categories/list", response_model=List[str])
def get_categories():
    products = db_manager.get_products()
    cats = sorted(list(set(p.get("category", "General") for p in products if p.get("category"))))
    return cats


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    product = db_manager.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return product


@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate):
    data = payload.model_dump()
    if not data.get("id"):
        data["id"] = f"P{str(uuid.uuid4())[:6].upper()}"
    
    # Check duplicate ID
    if db_manager.get_product(data["id"]):
        raise HTTPException(status_code=400, detail=f"Product ID '{data['id']}' already exists.")

    created = db_manager.create_product(data)
    return created


@router.put("/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update.")

    updated = db_manager.update_product(product_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return updated


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(product_id: str):
    success = db_manager.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return {"success": True, "message": f"Product '{product_id}' deleted successfully."}


@router.post("/{product_id}/adjust-stock", response_model=Product)
def adjust_product_stock(product_id: str, payload: ProductStockAdjustment):
    updated = db_manager.adjust_stock(product_id, payload.delta)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product '{product_id}' not found.")
    return updated
