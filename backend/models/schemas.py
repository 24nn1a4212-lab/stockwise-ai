"""
Pydantic schemas for request validation and response models in StockWise AI.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ==================== PRODUCT SCHEMAS ====================
class ProductBase(BaseModel):
    sku: str = Field(..., description="Stock Keeping Unit identifier")
    name: str = Field(..., description="Product commercial name")
    category: str = Field(..., description="Inventory category")
    description: Optional[str] = Field(None, description="Detailed product description")
    stock: int = Field(..., ge=0, description="Current units in stock")
    unit_cost: float = Field(..., ge=0.0, description="Procurement unit cost in USD")
    unit_price: float = Field(..., ge=0.0, description="Retail selling price in USD")
    reorder_point: int = Field(15, ge=0, description="Minimum stock threshold before alert")
    target_stock: int = Field(60, ge=0, description="Optimal target inventory ceiling")
    supplier_id: Optional[str] = Field(None, description="Associated supplier ID")
    supplier_name: Optional[str] = Field(None, description="Associated supplier company name")
    lead_time_days: int = Field(7, ge=1, description="Supplier delivery lead time in days")
    daily_demand: Optional[int] = Field(5, ge=0, description="Estimated average daily sales units")


class ProductCreate(ProductBase):
    id: Optional[str] = Field(None, description="Optional custom product ID; auto-generated if omitted")


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    unit_cost: Optional[float] = Field(None, ge=0.0)
    unit_price: Optional[float] = Field(None, ge=0.0)
    reorder_point: Optional[int] = Field(None, ge=0)
    target_stock: Optional[int] = Field(None, ge=0)
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    lead_time_days: Optional[int] = Field(None, ge=1)
    daily_demand: Optional[int] = Field(None, ge=0)


class Product(ProductBase):
    id: str
    status: str = Field(..., description="'Critical', 'Low Stock', or 'Healthy'")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProductStockAdjustment(BaseModel):
    delta: int = Field(..., description="Units to add (positive) or deduct (negative)")
    reason: Optional[str] = Field(None, description="Reason for adjustment, e.g. Audit, Restock, Damage")


# ==================== SALES SCHEMAS ====================
class SaleItem(BaseModel):
    product_id: str
    sku: Optional[str] = None
    product_name: str
    category: Optional[str] = None
    quantity: int = Field(..., ge=1)
    unit_price: float = Field(..., ge=0.0)
    unit_cost: Optional[float] = 0.0
    total: float = Field(..., ge=0.0)


class SaleCreate(BaseModel):
    id: Optional[str] = None
    customer_name: str
    channel: str = Field("Online Store", description="Online Store, B2B Direct, Enterprise Wholesale, Retail Outlet")
    payment_method: str = Field("Credit Card", description="Credit Card, Corporate Invoice, ACH Transfer, etc.")
    items: List[SaleItem]
    notes: Optional[str] = None


class Sale(SaleCreate):
    id: str
    order_id: str
    date: str
    total_amount: float
    status: str = "Completed"


# ==================== SUPPLIER SCHEMAS ====================
class SupplierBase(BaseModel):
    name: str
    contact_email: str
    phone: str
    lead_time_days: int = 7
    rating: float = 4.5
    categories_supplied: List[str] = []
    status: str = "Active"


class SupplierCreate(SupplierBase):
    id: Optional[str] = None


class Supplier(SupplierBase):
    id: str


# ==================== FORECAST SCHEMAS ====================
class ForecastPoint(BaseModel):
    date: str
    day_name: str
    predicted_demand: int
    lower_bound: int
    upper_bound: int


class ForecastResult(BaseModel):
    product_id: str
    product_name: str
    category: str
    horizon_days: int
    total_projected_demand: int
    avg_daily_demand: float
    confidence_level: float
    model_name: str
    r2_score: float
    mae: float
    rmse: float
    forecast_points: List[ForecastPoint]
    historical_points: List[Dict[str, Any]]
    stockout_projection_day: Optional[int] = Field(None, description="Day index where stock reaches 0 if not replenished")


class AggregateForecastResult(BaseModel):
    horizon_days: int
    total_projected_demand: int
    avg_daily_demand: float
    model_name: str
    r2_score: float
    forecast_points: List[ForecastPoint]


# ==================== REORDER RECOMMENDATION SCHEMAS ====================
class ReorderRecommendation(BaseModel):
    product_id: str
    sku: str
    product_name: str
    category: str
    current_stock: int
    reorder_point: int
    daily_velocity: float
    days_of_stock_left: float
    lead_time_days: int
    supplier_name: str
    supplier_id: Optional[str] = None
    eoq: int = Field(..., description="Economic Order Quantity calculated using inventory theory")
    recommended_order_qty: int
    unit_cost: float
    estimated_order_cost: float
    stockout_risk_score: int = Field(..., ge=0, le=100, description="Risk percentage from 0 to 100")
    urgency: str = Field(..., description="'CRITICAL', 'HIGH', 'MODERATE', or 'OPTIMAL'")
    recommended_action: str


class ReorderApprovalRequest(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1)
    supplier_id: Optional[str] = None
    notes: Optional[str] = None


class ReorderApprovalResponse(BaseModel):
    success: bool
    purchase_order_id: str
    product_id: str
    product_name: str
    units_ordered: int
    previous_stock: int
    new_stock: int
    total_cost: float
    message: str


# ==================== BUSINESS INSIGHTS & ANALYTICS SCHEMAS ====================
class BusinessInsight(BaseModel):
    id: str
    type: str = Field(..., description="'risk', 'opportunity', 'action', or 'efficiency'")
    title: str
    description: str
    impact_level: str = Field("Medium", description="'Critical', 'High', 'Medium', 'Low'")
    metric: Optional[str] = None
    suggested_action: str


class TopProductMetric(BaseModel):
    id: str
    name: str
    category: str
    units_sold: int
    revenue: float
    current_stock: int


class CategoryDistribution(BaseModel):
    category: str
    product_count: int
    total_units: int
    total_value: float


class DashboardKPIs(BaseModel):
    total_products: int
    total_units_in_stock: int
    total_inventory_value: float
    total_sales_revenue: float
    total_orders_count: int
    critical_alerts_count: int
    low_stock_alerts_count: int
    healthy_stock_count: int
    dead_stock_count: int
    avg_forecast_accuracy: float
    top_products: List[TopProductMetric]
    category_distribution: List[CategoryDistribution]
    urgent_alerts: List[Dict[str, Any]]
    recent_sales: List[Sale]
    insights: List[BusinessInsight]


# ==================== SYSTEM & STATUS SCHEMAS ====================
class DBStatusResponse(BaseModel):
    mongodb_connected: bool
    demo_mode: bool
    database_name: str
    message: str
    total_products: int
    total_sales: int
    storage_file: str


class MessageResponse(BaseModel):
    success: bool
    message: str
