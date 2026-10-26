import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
env_path = Path(__file__).parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "StockWise AI"
    PROJECT_DESCRIPTION: str = "Business Operations and Intelligence — Inventory Forecasting & AI Decision Support"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"

    # MongoDB Atlas Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DB_NAME: str = os.getenv("DB_NAME", "stockwise_ai")
    MONGODB_TIMEOUT_MS: int = int(os.getenv("MONGODB_TIMEOUT_MS", "3000"))

    # Demo Mode Override (defaults to auto-detecting MongoDB presence)
    FORCE_DEMO_MODE: bool = os.getenv("FORCE_DEMO_MODE", "false").lower() in ("true", "1", "yes")

    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
