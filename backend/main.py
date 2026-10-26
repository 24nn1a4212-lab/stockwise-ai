"""
Business Operations and Intelligence — StockWise AI
Main FastAPI Application Entrypoint.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import db_manager
from routers import products, sales, forecast, recommendations, analytics, reports, system

logger = logging.getLogger("stockwise.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database (MongoDB Atlas with fallback demo store)
    logger.info("Initializing StockWise AI Enterprise Backend...")
    db_manager.initialize()
    status = db_manager.get_status()
    logger.info("Database status: %s (Demo Mode: %s)", status["message"], status["demo_mode"])
    yield
    # Shutdown
    if db_manager.client:
        db_manager.client.close()
        logger.info("Closed MongoDB connection.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Feature Routers
app.include_router(products.router, prefix=settings.API_V1_PREFIX)
app.include_router(sales.router, prefix=settings.API_V1_PREFIX)
app.include_router(forecast.router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(system.router, prefix=settings.API_V1_PREFIX)


# ==================== LEGACY / ROOT COMPATIBILITY ENDPOINTS ====================
@app.get("/")
def home():
    status = db_manager.get_status()
    return {
        "application": "StockWise AI",
        "description": "Business Operations and Intelligence — Inventory Forecasting & AI Decision Support",
        "version": settings.VERSION,
        "status": "running",
        "demo_mode": status["demo_mode"],
        "mongodb_connected": status["mongodb_connected"],
        "docs_url": "/docs"
    }


@app.get("/api/health")
def health_check():
    status = db_manager.get_status()
    return {
        "status": "healthy",
        "application": "StockWise AI",
        "database": status
    }


@app.get("/api/alerts")
def get_stock_alerts():
    """Preserved legacy alerts endpoint for compatibility."""
    all_products = db_manager.get_products()
    alerts = []
    for prod in all_products:
        if prod.get("status") in ("Critical", "Low Stock"):
            alerts.append({
                "id": prod.get("id"),
                "name": prod.get("name"),
                "stock": prod.get("stock"),
                "status": prod.get("status")
            })

    return {
        "total_alerts": len(alerts),
        "alerts": alerts
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
