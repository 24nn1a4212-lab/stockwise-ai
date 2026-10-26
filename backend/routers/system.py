"""
System Diagnostics, Database Admin, and Seeder Router for StockWise AI.
"""
from typing import List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from database import db_manager
from models.schemas import DBStatusResponse, MessageResponse, Supplier, SupplierCreate
from config import settings
from pymongo import MongoClient

router = APIRouter(prefix="/system", tags=["System & Admin"])


class ConnectRequest(BaseModel):
    mongodb_uri: str = Field(..., description="MongoDB Atlas Connection String")
    db_name: str = Field("stockwise_ai", description="Database name")


@router.get("/status", response_model=DBStatusResponse)
def get_system_status():
    return db_manager.get_status()


@router.post("/seed/reset", response_model=MessageResponse)
def reset_seed_data():
    db_manager.reset_all_data()
    mode = "MongoDB Atlas" if not db_manager.using_fallback else "Demo Store (JSON)"
    return {
        "success": True,
        "message": f"Successfully reset and re-seeded enterprise dataset into {mode}."
    }


@router.post("/connect-mongodb", response_model=DBStatusResponse)
def connect_mongodb(payload: ConnectRequest):
    uri = payload.mongodb_uri.strip()
    if not uri:
        raise HTTPException(status_code=400, detail="MongoDB URI cannot be empty.")

    try:
        test_client = MongoClient(uri, serverSelectionTimeoutMS=4000)
        test_client.admin.command('ping')
        
        # If test succeeded, switch db_manager
        db_manager.client = test_client
        db_manager.db = test_client[payload.db_name]
        db_manager.using_fallback = False
        db_manager.fallback_reason = ""
        db_manager._ensure_mongodb_seeded()

        return db_manager.get_status()
    except Exception as err:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to connect to MongoDB Atlas: {str(err)}. Remaining in Demo Mode."
        )


@router.get("/suppliers", response_model=List[Supplier])
def get_suppliers():
    return db_manager.get_suppliers()


@router.post("/suppliers", response_model=Supplier)
def create_supplier(payload: SupplierCreate):
    data = payload.model_dump()
    if not data.get("id"):
        data["id"] = f"SUP-{len(db_manager.get_suppliers()) + 101}"
    return db_manager.create_supplier(data)
