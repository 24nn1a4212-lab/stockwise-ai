"""
Sales Management Router for StockWise AI.
Record transactions, auto-deduct inventory, and query sales history.
"""
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from database import db_manager
from models.schemas import Sale, SaleCreate, TopProductMetric

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("", response_model=dict)
def get_sales(
    limit: int = Query(200, ge=1, le=1000),
    channel: Optional[str] = Query(None)
):
    all_sales = db_manager.get_sales(limit=limit)
    if channel and channel.lower() != "all":
        all_sales = [s for s in all_sales if s.get("channel", "").lower() == channel.lower()]

    total_revenue = sum(s.get("total_amount", 0.0) for s in all_sales)
    return {
        "total_records": len(all_sales),
        "total_revenue": round(total_revenue, 2),
        "sales": all_sales
    }


@router.post("", response_model=Sale, status_code=status.HTTP_201_CREATED)
def record_sale(payload: SaleCreate):
    data = payload.model_dump()
    
    if not data.get("items"):
        raise HTTPException(status_code=400, detail="Sale must contain at least one line item.")

    # Validate stock and calculate total
    total_amount = 0.0
    enriched_items = []

    for item in data["items"]:
        prod = db_manager.get_product(item["product_id"])
        if not prod:
            raise HTTPException(
                status_code=404,
                detail=f"Product with ID '{item['product_id']}' not found in catalog."
            )
        
        req_qty = item["quantity"]
        current_stock = prod.get("stock", 0)
        
        # If insufficient stock, reject or adjust
        if current_stock < req_qty:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{prod.get('name')}'. "
                    f"Available: {current_stock}, Requested: {req_qty}"
                )
            )

        unit_price = item.get("unit_price") or prod.get("unit_price", 0.0)
        line_total = round(req_qty * unit_price, 2)
        total_amount += line_total

        enriched_items.append({
            "product_id": prod["id"],
            "sku": prod.get("sku"),
            "product_name": prod.get("name"),
            "category": prod.get("category"),
            "quantity": req_qty,
            "unit_price": unit_price,
            "unit_cost": prod.get("unit_cost", 0.0),
            "total": line_total
        })

    order_num = f"ORD-{int(datetime.now().timestamp()) % 100000:05d}"
    data["id"] = data.get("id") or order_num
    data["order_id"] = order_num
    data["items"] = enriched_items
    data["total_amount"] = round(total_amount, 2)
    data["date"] = datetime.now().isoformat()
    data["status"] = "Completed"

    created = db_manager.create_sale(data)
    return created


@router.get("/top-performers", response_model=List[TopProductMetric])
def get_top_performers(limit: int = 5):
    sales = db_manager.get_sales(limit=1000)
    products = {p["id"]: p for p in db_manager.get_products()}

    perf_map = {}
    for s in sales:
        for it in s.get("items", []):
            pid = it.get("product_id")
            if not pid:
                continue
            if pid not in perf_map:
                p_obj = products.get(pid, {})
                perf_map[pid] = {
                    "id": pid,
                    "name": it.get("product_name") or p_obj.get("name", "Unknown Product"),
                    "category": it.get("category") or p_obj.get("category", "General"),
                    "units_sold": 0,
                    "revenue": 0.0,
                    "current_stock": p_obj.get("stock", 0)
                }
            perf_map[pid]["units_sold"] += it.get("quantity", 0)
            perf_map[pid]["revenue"] += it.get("total", 0.0)

    results = list(perf_map.values())
    results.sort(key=lambda x: x["revenue"], reverse=True)
    for r in results:
        r["revenue"] = round(r["revenue"], 2)

    return results[:limit]
