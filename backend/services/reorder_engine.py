"""
AI Reorder Recommendation & Supply Chain Engine.
Calculates Economic Order Quantity (EOQ), Safety Stock, Stockout Risk, and Purchase Recommendations.
"""
import math
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional


class ReorderEngine:
    def __init__(self, ordering_cost: float = 45.0, holding_cost_ratio: float = 0.20):
        self.ordering_cost = ordering_cost  # S: procurement setup cost per order
        self.holding_cost_ratio = holding_cost_ratio  # H: 20% of unit cost per year

    def compute_daily_velocity(self, product_id: str, sales: List[dict], default_demand: int = 5) -> float:
        """Computes recent daily sales velocity over the past 30 days."""
        cutoff = datetime.now() - timedelta(days=30)
        total_sold = 0
        days_covered = 30

        for sale in sales:
            try:
                date_val = datetime.fromisoformat(sale.get("date", ""))
                if date_val >= cutoff:
                    for item in sale.get("items", []):
                        if item.get("product_id") == product_id:
                            total_sold += item.get("quantity", 0)
            except Exception:
                continue

        if total_sold > 0:
            return round(total_sold / days_covered, 2)
        return float(max(1, default_demand))

    def calculate_eoq(self, annual_demand: float, unit_cost: float) -> int:
        """
        Economic Order Quantity:
        EOQ = sqrt((2 * D * S) / H)
        """
        holding_cost = max(1.50, unit_cost * self.holding_cost_ratio)
        if annual_demand <= 0:
            return 20
        raw_eoq = math.sqrt((2 * annual_demand * self.ordering_cost) / holding_cost)
        return max(10, int(round(raw_eoq)))

    def evaluate_product(self, product: dict, sales: List[dict]) -> dict:
        product_id = product.get("id", "")
        stock = product.get("stock", 0)
        unit_cost = product.get("unit_cost", 20.0)
        lead_time = product.get("lead_time_days", 7)
        target_stock = product.get("target_stock", 70)
        reorder_point = product.get("reorder_point", 20)

        daily_velocity = self.compute_daily_velocity(
            product_id, sales, default_demand=product.get("daily_demand", 5)
        )
        annual_demand = daily_velocity * 365.0
        eoq = self.calculate_eoq(annual_demand, unit_cost)

        # Days of stock left
        days_left = round(stock / daily_velocity, 1) if daily_velocity > 0 else 999.0
        lead_time_demand = daily_velocity * lead_time

        # Stockout risk scoring (0 - 100)
        if stock <= 0:
            risk_score = 100
            urgency = "CRITICAL"
            action = f"Stockout occurred! Immediate emergency PO of {max(eoq, target_stock)} units required."
        elif days_left <= lead_time:
            # Stock will run out before supplier can deliver
            risk_score = min(98, max(85, int(100 - (days_left / lead_time) * 20)))
            urgency = "CRITICAL"
            action = f"Stockout risk imminent within {days_left} days (Lead time: {lead_time} days). Order immediately."
        elif days_left <= (lead_time * 1.6):
            risk_score = min(84, max(60, int(85 - ((days_left - lead_time) / lead_time) * 30)))
            urgency = "HIGH"
            action = f"Inventory approaching critical buffer threshold. Place replenishment order this week."
        elif stock <= reorder_point:
            risk_score = min(59, max(35, 45))
            urgency = "MODERATE"
            action = f"Stock has reached configured reorder point ({reorder_point} units). Routine reorder recommended."
        else:
            risk_score = max(5, min(25, int((reorder_point / max(1, stock)) * 25)))
            urgency = "OPTIMAL"
            action = f"Inventory level optimal with {days_left} days of buffer stock available."

        # Recommended order quantity
        recommended_qty = max(eoq, target_stock - stock) if urgency in ("CRITICAL", "HIGH", "MODERATE") else 0
        # If low/critical but target - stock is negative, order at least EOQ
        if urgency in ("CRITICAL", "HIGH") and recommended_qty <= 0:
            recommended_qty = eoq

        estimated_cost = round(recommended_qty * unit_cost, 2)

        return {
            "product_id": product_id,
            "sku": product.get("sku", ""),
            "product_name": product.get("name", ""),
            "category": product.get("category", ""),
            "current_stock": stock,
            "reorder_point": reorder_point,
            "daily_velocity": daily_velocity,
            "days_of_stock_left": days_left,
            "lead_time_days": lead_time,
            "supplier_name": product.get("supplier_name", "Primary Supplier"),
            "supplier_id": product.get("supplier_id"),
            "eoq": eoq,
            "recommended_order_qty": recommended_qty,
            "unit_cost": unit_cost,
            "estimated_order_cost": estimated_cost,
            "stockout_risk_score": risk_score,
            "urgency": urgency,
            "recommended_action": action
        }

    def generate_all_recommendations(self, products: List[dict], sales: List[dict]) -> List[dict]:
        recommendations = [self.evaluate_product(p, sales) for p in products]
        
        # Sort so highest risk / urgency appears first
        urgency_order = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2, "OPTIMAL": 3}
        recommendations.sort(
            key=lambda r: (urgency_order.get(r["urgency"], 4), -r["stockout_risk_score"], r["days_of_stock_left"])
        )
        return recommendations


reorder_engine = ReorderEngine()
