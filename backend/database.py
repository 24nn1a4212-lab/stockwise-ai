"""
Database manager supporting MongoDB Atlas and seamless local JSON/Memory fallback.
Guarantees the system works out-of-the-box in demo mode even if MongoDB credentials are missing.
"""
import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from config import settings
from sample_data import SAMPLE_PRODUCTS, SAMPLE_SALES, SAMPLE_SUPPLIERS

logger = logging.getLogger("stockwise.database")
logging.basicConfig(level=logging.INFO)

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DEMO_STORAGE_FILE = DATA_DIR / "demo_store.json"


class FallbackStore:
    """Local JSON-backed persistent store for seamless demo mode."""
    def __init__(self):
        self.products: List[dict] = []
        self.sales: List[dict] = []
        self.suppliers: List[dict] = []
        self._load_or_initialize()

    def _load_or_initialize(self):
        if DEMO_STORAGE_FILE.exists():
            try:
                with open(DEMO_STORAGE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.products = data.get("products", [])
                    self.sales = data.get("sales", [])
                    self.suppliers = data.get("suppliers", [])
                    logger.info("Loaded demo state from %s (%d products, %d sales)", 
                                DEMO_STORAGE_FILE, len(self.products), len(self.sales))
                    if self.products and self.sales:
                        return
            except Exception as e:
                logger.warning("Could not read demo storage file, reinitializing: %s", e)

        self.reset_to_sample_data()

    def save(self):
        try:
            with open(DEMO_STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "products": self.products,
                    "sales": self.sales,
                    "suppliers": self.suppliers,
                    "saved_at": datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            logger.error("Error saving demo store to file: %s", e)

    def reset_to_sample_data(self):
        # Deep copies of sample data
        self.products = json.loads(json.dumps(SAMPLE_PRODUCTS))
        self.sales = json.loads(json.dumps(SAMPLE_SALES))
        self.suppliers = json.loads(json.dumps(SAMPLE_SUPPLIERS))
        self.save()
        logger.info("Demo store reset to initial sample data (%d products, %d sales)", 
                    len(self.products), len(self.sales))


class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.using_fallback: bool = True
        self.fallback_reason: str = "Uninitialized"
        self.fallback_store: FallbackStore = FallbackStore()

    def initialize(self):
        """Attempts to connect to MongoDB Atlas; falls back to local demo store on failure."""
        if settings.FORCE_DEMO_MODE:
            self.using_fallback = True
            self.fallback_reason = "Demo Mode explicitly enabled via FORCE_DEMO_MODE=true"
            logger.info(self.fallback_reason)
            return

        uri = settings.MONGODB_URI.strip()
        if not uri:
            self.using_fallback = True
            self.fallback_reason = "MONGODB_URI environment variable not configured. Running in Demo Store Mode."
            logger.info(self.fallback_reason)
            return

        try:
            logger.info("Attempting connection to MongoDB Atlas...")
            self.client = MongoClient(
                uri,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_MS,
                connectTimeoutMS=settings.MONGODB_TIMEOUT_MS
            )
            # Force server check
            self.client.admin.command('ping')
            self.db = self.client[settings.DB_NAME]
            self.using_fallback = False
            self.fallback_reason = ""
            logger.info("Successfully connected to MongoDB Atlas database '%s'", settings.DB_NAME)

            # Auto-seed if collections are empty
            self._ensure_mongodb_seeded()
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as err:
            self.using_fallback = True
            self.fallback_reason = f"MongoDB Atlas connection unavailable ({str(err)}). Seamlessly switched to Demo Store Mode."
            logger.warning(self.fallback_reason)

    def _ensure_mongodb_seeded(self):
        if self.using_fallback or self.db is None:
            return
        try:
            prod_count = self.db.products.count_documents({})
            if prod_count == 0:
                logger.info("MongoDB 'products' collection is empty. Seeding initial sample data...")
                self.db.products.insert_many(json.loads(json.dumps(SAMPLE_PRODUCTS)))
                self.db.sales.insert_many(json.loads(json.dumps(SAMPLE_SALES)))
                self.db.suppliers.insert_many(json.loads(json.dumps(SAMPLE_SUPPLIERS)))
                logger.info("MongoDB seeding completed.")
        except Exception as e:
            logger.error("Error auto-seeding MongoDB: %s", e)

    def get_status(self) -> dict:
        total_products = len(self.get_products())
        total_sales = len(self.get_sales())
        return {
            "mongodb_connected": not self.using_fallback,
            "demo_mode": self.using_fallback,
            "database_name": settings.DB_NAME if not self.using_fallback else "LocalDemoStore (JSON)",
            "message": "Connected to MongoDB Atlas" if not self.using_fallback else self.fallback_reason,
            "total_products": total_products,
            "total_sales": total_sales,
            "storage_file": str(DEMO_STORAGE_FILE) if self.using_fallback else "MongoDB Atlas Cloud"
        }

    # ==================== PRODUCT OPERATIONS ====================
    def get_products(self, category: Optional[str] = None, search: Optional[str] = None) -> List[dict]:
        if not self.using_fallback and self.db is not None:
            query = {}
            if category and category.lower() != "all":
                query["category"] = category
            if search:
                query["$or"] = [
                    {"name": {"$regex": search, "$options": "i"}},
                    {"sku": {"$regex": search, "$options": "i"}},
                    {"category": {"$regex": search, "$options": "i"}},
                ]
            cursor = self.db.products.find(query, {"_id": 0})
            return list(cursor)

        # Fallback store
        results = self.fallback_store.products
        if category and category.lower() != "all":
            results = [p for p in results if p.get("category", "").lower() == category.lower()]
        if search:
            s = search.lower()
            results = [
                p for p in results
                if s in p.get("name", "").lower() or s in p.get("sku", "").lower() or s in p.get("category", "").lower()
            ]
        return results

    def get_product(self, product_id: str) -> Optional[dict]:
        if not self.using_fallback and self.db is not None:
            return self.db.products.find_one({"id": product_id}, {"_id": 0})
        for p in self.fallback_store.products:
            if p.get("id") == product_id:
                return p
        return None

    def create_product(self, product_data: dict) -> dict:
        # Calculate status
        stock = product_data.get("stock", 0)
        reorder_pt = product_data.get("reorder_point", 15)
        if stock <= reorder_pt * 0.5:
            status = "Critical"
        elif stock <= reorder_pt:
            status = "Low Stock"
        else:
            status = "Healthy"
        product_data["status"] = status
        product_data["created_at"] = datetime.now().isoformat()
        product_data["updated_at"] = datetime.now().isoformat()

        if not self.using_fallback and self.db is not None:
            self.db.products.insert_one(dict(product_data))
            created = self.db.products.find_one({"id": product_data["id"]}, {"_id": 0})
            return created or product_data

        # Fallback store
        self.fallback_store.products.append(product_data)
        self.fallback_store.save()
        return product_data

    def update_product(self, product_id: str, updates: dict) -> Optional[dict]:
        updates["updated_at"] = datetime.now().isoformat()

        if not self.using_fallback and self.db is not None:
            existing = self.db.products.find_one({"id": product_id})
            if not existing:
                return None
            
            merged = {**existing, **updates}
            stock = merged.get("stock", 0)
            reorder_pt = merged.get("reorder_point", 15)
            if stock <= reorder_pt * 0.5:
                status = "Critical"
            elif stock <= reorder_pt:
                status = "Low Stock"
            else:
                status = "Healthy"
            updates["status"] = status
            
            self.db.products.update_one({"id": product_id}, {"$set": updates})
            return self.db.products.find_one({"id": product_id}, {"_id": 0})

        # Fallback store
        for i, p in enumerate(self.fallback_store.products):
            if p.get("id") == product_id:
                p.update(updates)
                stock = p.get("stock", 0)
                reorder_pt = p.get("reorder_point", 15)
                if stock <= reorder_pt * 0.5:
                    p["status"] = "Critical"
                elif stock <= reorder_pt:
                    p["status"] = "Low Stock"
                else:
                    p["status"] = "Healthy"
                self.fallback_store.save()
                return p
        return None

    def delete_product(self, product_id: str) -> bool:
        if not self.using_fallback and self.db is not None:
            res = self.db.products.delete_one({"id": product_id})
            return res.deleted_count > 0

        original_len = len(self.fallback_store.products)
        self.fallback_store.products = [p for p in self.fallback_store.products if p.get("id") != product_id]
        if len(self.fallback_store.products) < original_len:
            self.fallback_store.save()
            return True
        return False

    def adjust_stock(self, product_id: str, delta: int) -> Optional[dict]:
        product = self.get_product(product_id)
        if not product:
            return None
        new_stock = max(0, product.get("stock", 0) + delta)
        return self.update_product(product_id, {"stock": new_stock})

    # ==================== SALES OPERATIONS ====================
    def get_sales(self, limit: int = 500) -> List[dict]:
        if not self.using_fallback and self.db is not None:
            cursor = self.db.sales.find({}, {"_id": 0}).sort("date", -1).limit(limit)
            return list(cursor)
        
        # Sort sales descending by date
        sorted_sales = sorted(
            self.fallback_store.sales,
            key=lambda x: x.get("date", ""),
            reverse=True
        )
        return sorted_sales[:limit]

    def create_sale(self, sale_data: dict) -> dict:
        sale_data["date"] = sale_data.get("date") or datetime.now().isoformat()
        
        # Deduct product stocks
        for item in sale_data.get("items", []):
            prod_id = item.get("product_id")
            qty = item.get("quantity", 0)
            if prod_id and qty > 0:
                self.adjust_stock(prod_id, -qty)

        if not self.using_fallback and self.db is not None:
            self.db.sales.insert_one(dict(sale_data))
            created = self.db.sales.find_one({"id": sale_data["id"]}, {"_id": 0})
            return created or sale_data

        self.fallback_store.sales.insert(0, sale_data)
        self.fallback_store.save()
        return sale_data

    # ==================== SUPPLIERS OPERATIONS ====================
    def get_suppliers(self) -> List[dict]:
        if not self.using_fallback and self.db is not None:
            return list(self.db.suppliers.find({}, {"_id": 0}))
        return self.fallback_store.suppliers

    def create_supplier(self, supplier_data: dict) -> dict:
        if not self.using_fallback and self.db is not None:
            self.db.suppliers.insert_one(dict(supplier_data))
            created = self.db.suppliers.find_one({"id": supplier_data["id"]}, {"_id": 0})
            return created or supplier_data
        
        self.fallback_store.suppliers.append(supplier_data)
        self.fallback_store.save()
        return supplier_data

    # ==================== RESET / RE-SEED ====================
    def reset_all_data(self):
        if not self.using_fallback and self.db is not None:
            self.db.products.delete_many({})
            self.db.sales.delete_many({})
            self.db.suppliers.delete_many({})
            self.db.products.insert_many(json.loads(json.dumps(SAMPLE_PRODUCTS)))
            self.db.sales.insert_many(json.loads(json.dumps(SAMPLE_SALES)))
            self.db.suppliers.insert_many(json.loads(json.dumps(SAMPLE_SUPPLIERS)))
            logger.info("Reset MongoDB Atlas database to sample enterprise data.")
        else:
            self.fallback_store.reset_to_sample_data()
            logger.info("Reset local demo store to sample enterprise data.")


db_manager = DatabaseManager()
