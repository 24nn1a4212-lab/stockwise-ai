"""
System Diagnostics, Database Admin, and Seeder Router for StockWise AI.
"""
import logging
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

from database import db_manager
from models.schemas import DBStatusResponse, MessageResponse, Supplier, SupplierCreate
from config import settings
from pymongo import MongoClient

logger = logging.getLogger("stockwise.system")
router = APIRouter(prefix="/system", tags=["System & Admin"])


def _persist_to_env(uri: str, db_name: str):
    """Persist working MongoDB credentials to .env for subsequent runs."""
    try:
        env_path = Path(__file__).parent.parent / ".env"
        lines = []
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

        has_uri = False
        has_db = False
        new_lines = []
        for line in lines:
            if line.startswith("MONGODB_URI="):
                new_lines.append(f"MONGODB_URI={uri}\n")
                has_uri = True
            elif line.startswith("DB_NAME="):
                new_lines.append(f"DB_NAME={db_name}\n")
                has_db = True
            else:
                new_lines.append(line)
        if not has_uri:
            new_lines.append(f"MONGODB_URI={uri}\n")
        if not has_db:
            new_lines.append(f"DB_NAME={db_name}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        logger.info("Successfully persisted MongoDB URI to .env")
    except Exception as e:
        logger.warning("Could not persist to .env file: %s", e)


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
        _persist_to_env(uri, payload.db_name)

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
