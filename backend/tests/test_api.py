"""
Automated Integration and Unit Test Suite for StockWise AI.
Tests database resilience, API endpoints, ML forecasting, and report generators.
"""
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from main import app
from database import db_manager


@pytest.fixture(scope="module")
def client():
    # Force initialize database in demo mode for isolated testing
    db_manager.initialize()
    db_manager.reset_all_data()
    with TestClient(app) as test_client:
        yield test_client


def test_home_and_health_check(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "running"
    assert "application" in data

    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["status"] == "healthy"
    assert "database" in health_data


def test_system_status(client):
    res = client.get("/api/system/status")
    assert res.status_code == 200
    data = res.json()
    assert "demo_mode" in data
    assert data["total_products"] > 0
    assert data["total_sales"] > 0


def test_get_products(client):
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert "products" in data
    assert data["total"] >= 5
    assert any(p["id"] == "P001" for p in data["products"])


def test_filter_products(client):
    res = client.get("/api/products?category=Electronics")
    assert res.status_code == 200
    data = res.json()
    assert all(p["category"] == "Electronics" for p in data["products"])


def test_product_stock_adjustment(client):
    # Get initial stock of P001
    prod = client.get("/api/products/P001").json()
    initial_stock = prod["stock"]

    # Adjust stock by +5
    adj_res = client.post("/api/products/P001/adjust-stock", json={"delta": 5, "reason": "Restock audit"})
    assert adj_res.status_code == 200
    updated_stock = adj_res.json()["stock"]
    assert updated_stock == initial_stock + 5

    # Revert back
    client.post("/api/products/P001/adjust-stock", json={"delta": -5})


def test_get_sales(client):
    res = client.get("/api/sales")
    assert res.status_code == 200
    data = res.json()
    assert data["total_records"] > 0
    assert data["total_revenue"] > 0


def test_record_sale_and_inventory_deduction(client):
    prod = client.get("/api/products/P003").json()
    start_stock = prod["stock"]
    sale_qty = 2

    payload = {
        "customer_name": "Test QA Buyer",
        "channel": "Online Store",
        "payment_method": "Credit Card",
        "items": [
            {
                "product_id": "P003",
                "product_name": prod["name"],
                "quantity": sale_qty,
                "unit_price": prod["unit_price"],
                "total": round(sale_qty * prod["unit_price"], 2)
            }
        ]
    }

    sale_res = client.post("/api/sales", json=payload)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert sale_data["order_id"].startswith("ORD-")

    # Verify inventory was automatically decremented
    updated_prod = client.get("/api/products/P003").json()
    assert updated_prod["stock"] == start_stock - sale_qty


def test_demand_forecasting(client):
    # Test specific product forecast
    res = client.get("/api/forecast/product/P001?days=14")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "P001"
    assert data["horizon_days"] == 14
    assert len(data["forecast_points"]) == 14
    assert data["r2_score"] > 0.70
    assert "model_name" in data

    # Test aggregate forecast
    agg_res = client.get("/api/forecast/aggregate?days=7")
    assert agg_res.status_code == 200
    agg_data = agg_res.json()
    assert agg_data["horizon_days"] == 7
    assert len(agg_data["forecast_points"]) == 7


def test_reorder_recommendations(client):
    res = client.get("/api/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    first_rec = data[0]
    assert "eoq" in first_rec
    assert "stockout_risk_score" in first_rec
    assert first_rec["eoq"] > 0
    assert first_rec["urgency"] in ("CRITICAL", "HIGH", "MODERATE", "OPTIMAL")


def test_approve_reorder_action(client):
    prod = client.get("/api/products/P004").json()
    initial_stock = prod["stock"]

    payload = {
        "product_id": "P004",
        "quantity": 25,
        "notes": "Emergency PO approval"
    }

    res = client.post("/api/recommendations/reorder", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["new_stock"] == initial_stock + 25

    # Verify updated stock in products API
    refreshed = client.get("/api/products/P004").json()
    assert refreshed["stock"] == initial_stock + 25


def test_analytics_dashboard(client):
    res = client.get("/api/analytics/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["total_products"] > 0
    assert data["total_inventory_value"] > 0
    assert len(data["category_distribution"]) > 0
    assert len(data["top_products"]) > 0
    assert len(data["insights"]) > 0


def test_reports_csv_and_pdf(client):
    # Inventory CSV
    inv_res = client.get("/api/reports/inventory/csv")
    assert inv_res.status_code == 200
    assert "text/csv" in inv_res.headers["content-type"]
    assert "SKU" in inv_res.text

    # Sales CSV
    sales_res = client.get("/api/reports/sales/csv")
    assert sales_res.status_code == 200
    assert "text/csv" in sales_res.headers["content-type"]
    assert "Order ID" in sales_res.text

    # Executive PDF
    pdf_res = client.get("/api/reports/executive/pdf")
    assert pdf_res.status_code == 200
    assert "application/pdf" in pdf_res.headers["content-type"]
    assert pdf_res.content.startswith(b"%PDF")
