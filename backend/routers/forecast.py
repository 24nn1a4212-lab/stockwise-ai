"""
Demand Forecasting Router for StockWise AI.
Scikit-learn powered time-series regression and confidence interval projections.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from database import db_manager
from models.schemas import ForecastResult, AggregateForecastResult
from services.forecast_engine import forecast_engine

router = APIRouter(prefix="/forecast", tags=["Demand Forecasting"])


@router.get("/product/{product_id}", response_model=ForecastResult)
def get_product_forecast(
    product_id: str,
    days: int = Query(14, ge=7, le=60, description="Forecast horizon in days (7, 14, 30, 60)")
):
    product = db_manager.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")

    sales = db_manager.get_sales(limit=1000)
    forecast_data = forecast_engine.generate_forecast(product, sales, horizon_days=days)
    return forecast_data


@router.get("/aggregate", response_model=AggregateForecastResult)
def get_aggregate_forecast(
    days: int = Query(14, ge=7, le=60, description="Forecast horizon in days (7, 14, 30, 60)")
):
    sales = db_manager.get_sales(limit=1000)
    aggregate_data = forecast_engine.generate_aggregate_forecast(sales, horizon_days=days)
    return aggregate_data
