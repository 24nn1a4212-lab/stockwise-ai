"""
AI Reorder Recommendation Router for StockWise AI.
Economic Order Quantity (EOQ), stockout risk scoring, and 1-click reorder approvals.
"""
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException

from database import db_manager
from models.schemas import ReorderRecommendation, ReorderApprovalRequest, ReorderApprovalResponse
from services.reorder_engine import reorder_engine

router = APIRouter(prefix="/recommendations", tags=["Reorder Recommendations"])


@router.get("", response_model=List[ReorderRecommendation])
def get_recommendations():
    products = db_manager.get_products()
    sales = db_manager.get_sales(limit=1000)
    recs = reorder_engine.generate_all_recommendations(products, sales)
    return recs


@router.post("/reorder", response_model=ReorderApprovalResponse)
def approve_reorder(payload: ReorderApprovalRequest):
    product = db_manager.get_product(payload.product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with ID '{payload.product_id}' not found."
        )

    qty = payload.quantity
    prev_stock = product.get("stock", 0)
    unit_cost = product.get("unit_cost", 0.0)
    total_cost = round(qty * unit_cost, 2)

    # Increment stock
    updated_product = db_manager.adjust_stock(payload.product_id, qty)
    new_stock = updated_product.get("stock", prev_stock + qty) if updated_product else prev_stock + qty

    po_id = f"PO-{int(datetime.now().timestamp()) % 100000:05d}"

    return {
        "success": True,
        "purchase_order_id": po_id,
        "product_id": payload.product_id,
        "product_name": product.get("name", "Product"),
        "units_ordered": qty,
        "previous_stock": prev_stock,
        "new_stock": new_stock,
        "total_cost": total_cost,
        "message": (
            f"Successfully generated Purchase Order {po_id}. "
            f"Stock for '{product.get('name')}' replenished from {prev_stock} to {new_stock} units."
        )
    }
