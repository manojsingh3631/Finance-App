from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class CalculationSave(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    calculator_type: str  # "sip" or "swp"
    inputs: dict
    outputs: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    name: Optional[str] = None

class CalculationCreate(BaseModel):
    calculator_type: str
    inputs: dict
    outputs: dict
    name: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Financial Calculator API"}

@api_router.post("/calculations", response_model=CalculationSave)
async def save_calculation(input: CalculationCreate):
    calc_dict = input.model_dump()
    calc_obj = CalculationSave(**calc_dict)
    
    doc = calc_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.calculations.insert_one(doc)
    return calc_obj

@api_router.get("/calculations", response_model=List[CalculationSave])
async def get_calculations():
    calculations = await db.calculations.find({}, {"_id": 0}).to_list(100)
    
    for calc in calculations:
        if isinstance(calc['timestamp'], str):
            calc['timestamp'] = datetime.fromisoformat(calc['timestamp'])
    
    return calculations

@api_router.delete("/calculations/{calc_id}")
async def delete_calculation(calc_id: str):
    result = await db.calculations.delete_one({"id": calc_id})
    return {"deleted": result.deleted_count > 0}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()