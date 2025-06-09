from fastapi import FastAPI, APIRouter, HTTPException, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from bson import ObjectId
from enum import Enum

# MongoDB configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "preclinical_research")

# MongoDB client (will be initialized on startup)
client = None
db = None

# Create the main app without a prefix
app = FastAPI(title="Preclinical Research Management API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class VisitStatus(str, Enum):
    SCHEDULED = "Scheduled"
    UPCOMING = "Upcoming"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    MISSED = "Missed"
    SKIPPED = "Skipped"

class ProcedureCategory(str, Enum):
    SAMPLE_COLLECTION = "Sample Collection"
    IN_LIFE_MEASUREMENT = "In-life Measurement"
    TERMINAL_PROCEDURE = "Terminal Procedure"
    BIOANALYSIS = "Bioanalysis"
    OBSERVATION = "Observation"

class InputFieldType(str, Enum):
    STRING = "string"
    TEXT_AREA = "text_area"
    NUMBER = "number"
    INTEGER = "integer"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    DATE = "date"
    TIME = "time"
    DROPDOWN = "dropdown"

# Pydantic Models
class InputField(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    label: str
    field_type: InputFieldType
    is_mandatory: bool = False
    units: Optional[str] = None
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None  # For radio, checkbox, dropdown

class InputFieldCreate(BaseModel):
    name: str
    label: str
    field_type: InputFieldType
    is_mandatory: bool = False
    units: Optional[str] = None
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None

class MasterProcedure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: ProcedureCategory
    description: str
    default_cost: float
    currency: str = "USD"
    parent_id: Optional[str] = None  # For hierarchical procedures
    input_fields: List[InputField] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MasterProcedureCreate(BaseModel):
    name: str
    category: ProcedureCategory
    description: str
    default_cost: float
    currency: str = "USD"
    parent_id: Optional[str] = None
    input_fields: List[InputFieldCreate] = []

class MasterProcedureUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[ProcedureCategory] = None
    description: Optional[str] = None
    default_cost: Optional[float] = None
    currency: Optional[str] = None
    input_fields: Optional[List[InputFieldCreate]] = None
    is_active: Optional[bool] = None

class Animal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    animal_id: str  # External animal identifier
    species: str
    strain: Optional[str] = None
    sex: str
    birth_date: Optional[date] = None
    weight: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnimalCreate(BaseModel):
    animal_id: str
    species: str
    strain: Optional[str] = None
    sex: str
    birth_date: Optional[date] = None
    weight: Optional[float] = None

class Study(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    principal_investigator: str
    status: str = "Planning"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StudyCreate(BaseModel):
    name: str
    description: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    principal_investigator: str
    status: str = "Planning"

class Cohort(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    study_id: str
    name: str
    description: str
    criteria: Optional[str] = None
    planned_animal_count: int
    animal_ids: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CohortCreate(BaseModel):
    study_id: str
    name: str
    description: str
    criteria: Optional[str] = None
    planned_animal_count: int

class CohortUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    criteria: Optional[str] = None
    planned_animal_count: Optional[int] = None

class StudyProcedure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    study_id: str
    master_procedure_id: str
    name: str  # Snapshot from master
    category: ProcedureCategory  # Snapshot from master
    description: str  # Snapshot from master
    study_specific_cost: Optional[float] = None  # Override cost
    currency: str = "USD"
    input_fields: List[InputField] = []  # Snapshot from master
    imported_at: datetime = Field(default_factory=datetime.utcnow)

class StudyProcedureCreate(BaseModel):
    master_procedure_id: str
    study_specific_cost: Optional[float] = None

class Visit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    study_id: str
    name: str
    label: str
    description: Optional[str] = None
    planned_timepoint: str  # e.g., "Day 0", "Day 7 +/- 1 day"
    planned_date: Optional[date] = None
    actual_date: Optional[date] = None
    cohort_ids: List[str] = []
    status: VisitStatus = VisitStatus.SCHEDULED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class VisitCreate(BaseModel):
    study_id: str
    name: str
    label: str
    description: Optional[str] = None
    planned_timepoint: str
    planned_date: Optional[date] = None
    cohort_ids: List[str] = []

class VisitUpdate(BaseModel):
    name: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None
    planned_timepoint: Optional[str] = None
    planned_date: Optional[date] = None
    actual_date: Optional[date] = None
    cohort_ids: Optional[List[str]] = None
    status: Optional[VisitStatus] = None

class VisitProcedure(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    visit_id: str
    study_procedure_id: str
    sequence_order: Optional[int] = None
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class VisitProcedureCreate(BaseModel):
    study_procedure_id: str
    sequence_order: Optional[int] = None

# Status Check Models (keeping existing functionality)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Utility function to convert ObjectId to string and handle dates
def to_dict(item):
    if item is None:
        return None
    if isinstance(item, dict):
        item.pop('_id', None)
        # Convert date objects to strings
        for key, value in item.items():
            if isinstance(value, date) and not isinstance(value, datetime):
                item[key] = value.isoformat()
    return item

# MASTER PROCEDURE LIBRARY ENDPOINTS

@api_router.post("/master-procedures", response_model=MasterProcedure)
async def create_master_procedure(procedure: MasterProcedureCreate):
    """Create a new master procedure in the library."""
    # Convert input fields
    input_fields = [InputField(**field.dict()) for field in procedure.input_fields]
    
    procedure_dict = procedure.dict()
    procedure_dict['input_fields'] = [field.dict() for field in input_fields]
    procedure_obj = MasterProcedure(**procedure_dict)
    
    await db.master_procedures.insert_one(procedure_obj.dict())
    return procedure_obj

@api_router.get("/master-procedures", response_model=List[MasterProcedure])
async def get_master_procedures(active_only: bool = Query(True)):
    """Get all master procedures from the library."""
    filter_dict = {"is_active": True} if active_only else {}
    procedures = await db.master_procedures.find(filter_dict).to_list(1000)
    return [MasterProcedure(**to_dict(proc)) for proc in procedures]

@api_router.get("/master-procedures/{procedure_id}", response_model=MasterProcedure)
async def get_master_procedure(procedure_id: str):
    """Get a specific master procedure by ID."""
    procedure = await db.master_procedures.find_one({"id": procedure_id})
    if not procedure:
        raise HTTPException(status_code=404, detail="Master procedure not found")
    return MasterProcedure(**to_dict(procedure))

@api_router.put("/master-procedures/{procedure_id}", response_model=MasterProcedure)
async def update_master_procedure(procedure_id: str, update_data: MasterProcedureUpdate):
    """Update a master procedure."""
    procedure = await db.master_procedures.find_one({"id": procedure_id})
    if not procedure:
        raise HTTPException(status_code=404, detail="Master procedure not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    if 'input_fields' in update_dict:
        update_dict['input_fields'] = [InputField(**field).dict() for field in update_dict['input_fields']]
    
    update_dict['updated_at'] = datetime.utcnow()
    
    await db.master_procedures.update_one({"id": procedure_id}, {"$set": update_dict})
    
    updated_procedure = await db.master_procedures.find_one({"id": procedure_id})
    return MasterProcedure(**to_dict(updated_procedure))

@api_router.delete("/master-procedures/{procedure_id}")
async def delete_master_procedure(procedure_id: str):
    """Delete a master procedure (archive it)."""
    result = await db.master_procedures.update_one(
        {"id": procedure_id}, 
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Master procedure not found")
    return {"message": "Master procedure archived successfully"}

# ANIMAL ENDPOINTS

@api_router.post("/animals", response_model=Animal)
async def create_animal(animal: AnimalCreate):
    """Create a new animal."""
    animal_dict = animal.dict()
    # Convert date to string for MongoDB storage
    if 'birth_date' in animal_dict and animal_dict['birth_date']:
        animal_dict['birth_date'] = animal_dict['birth_date'].isoformat()
    
    animal_obj = Animal(**animal.dict())
    animal_obj_dict = animal_obj.dict()
    if 'birth_date' in animal_obj_dict and isinstance(animal_obj_dict['birth_date'], date):
        animal_obj_dict['birth_date'] = animal_obj_dict['birth_date'].isoformat()
    
    await db.animals.insert_one(animal_obj_dict)
    return animal_obj

@api_router.get("/animals", response_model=List[Animal])
async def get_animals():
    """Get all animals."""
    animals = await db.animals.find({"is_active": True}).to_list(1000)
    return [Animal(**to_dict(animal)) for animal in animals]

@api_router.get("/animals/{animal_id}", response_model=Animal)
async def get_animal(animal_id: str):
    """Get a specific animal by ID."""
    animal = await db.animals.find_one({"id": animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return Animal(**to_dict(animal))

# STUDY ENDPOINTS

@api_router.post("/studies", response_model=Study)
async def create_study(study: StudyCreate):
    """Create a new study."""
    study_dict = study.dict()
    # Convert dates to strings for MongoDB storage
    if 'start_date' in study_dict and study_dict['start_date']:
        study_dict['start_date'] = study_dict['start_date'].isoformat()
    if 'end_date' in study_dict and study_dict['end_date']:
        study_dict['end_date'] = study_dict['end_date'].isoformat()
    
    study_obj = Study(**study.dict())
    study_obj_dict = study_obj.dict()
    if 'start_date' in study_obj_dict and isinstance(study_obj_dict['start_date'], date):
        study_obj_dict['start_date'] = study_obj_dict['start_date'].isoformat()
    if 'end_date' in study_obj_dict and isinstance(study_obj_dict['end_date'], date):
        study_obj_dict['end_date'] = study_obj_dict['end_date'].isoformat()
    
    await db.studies.insert_one(study_obj_dict)
    return study_obj

@api_router.get("/studies", response_model=List[Study])
async def get_studies():
    """Get all studies."""
    studies = await db.studies.find().to_list(1000)
    return [Study(**to_dict(study)) for study in studies]

@api_router.get("/studies/{study_id}", response_model=Study)
async def get_study(study_id: str):
    """Get a specific study by ID."""
    study = await db.studies.find_one({"id": study_id})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return Study(**to_dict(study))

# COHORT ENDPOINTS

@api_router.post("/cohorts", response_model=Cohort)
async def create_cohort(cohort: CohortCreate):
    """Create a new cohort within a study."""
    # Verify study exists
    study = await db.studies.find_one({"id": cohort.study_id})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    cohort_obj = Cohort(**cohort.dict())
    await db.cohorts.insert_one(cohort_obj.dict())
    return cohort_obj

@api_router.get("/studies/{study_id}/cohorts", response_model=List[Cohort])
async def get_study_cohorts(study_id: str):
    """Get all cohorts for a specific study."""
    cohorts = await db.cohorts.find({"study_id": study_id}).to_list(1000)
    return [Cohort(**to_dict(cohort)) for cohort in cohorts]

@api_router.get("/cohorts/{cohort_id}", response_model=Cohort)
async def get_cohort(cohort_id: str):
    """Get a specific cohort by ID."""
    cohort = await db.cohorts.find_one({"id": cohort_id})
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    return Cohort(**to_dict(cohort))

@api_router.put("/cohorts/{cohort_id}", response_model=Cohort)
async def update_cohort(cohort_id: str, update_data: CohortUpdate):
    """Update a cohort."""
    cohort = await db.cohorts.find_one({"id": cohort_id})
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    update_dict['updated_at'] = datetime.utcnow()
    
    await db.cohorts.update_one({"id": cohort_id}, {"$set": update_dict})
    
    updated_cohort = await db.cohorts.find_one({"id": cohort_id})
    return Cohort(**to_dict(updated_cohort))

@api_router.post("/cohorts/{cohort_id}/animals/{animal_id}")
async def assign_animal_to_cohort(cohort_id: str, animal_id: str):
    """Assign an animal to a cohort."""
    # Verify cohort and animal exist
    cohort = await db.cohorts.find_one({"id": cohort_id})
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    animal = await db.animals.find_one({"id": animal_id})
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    # Check if animal is already assigned to this cohort
    if animal_id in cohort.get('animal_ids', []):
        raise HTTPException(status_code=400, detail="Animal already assigned to this cohort")
    
    await db.cohorts.update_one(
        {"id": cohort_id}, 
        {"$addToSet": {"animal_ids": animal_id}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Animal assigned to cohort successfully"}

@api_router.delete("/cohorts/{cohort_id}/animals/{animal_id}")
async def remove_animal_from_cohort(cohort_id: str, animal_id: str):
    """Remove an animal from a cohort."""
    result = await db.cohorts.update_one(
        {"id": cohort_id}, 
        {"$pull": {"animal_ids": animal_id}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    return {"message": "Animal removed from cohort successfully"}

@api_router.delete("/cohorts/{cohort_id}")
async def delete_cohort(cohort_id: str):
    """Delete an empty cohort."""
    cohort = await db.cohorts.find_one({"id": cohort_id})
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    
    if cohort.get('animal_ids', []):
        raise HTTPException(status_code=400, detail="Cannot delete cohort with assigned animals")
    
    await db.cohorts.delete_one({"id": cohort_id})
    return {"message": "Cohort deleted successfully"}

# STUDY PROCEDURE ENDPOINTS (Importing procedures into studies)

@api_router.post("/studies/{study_id}/procedures", response_model=StudyProcedure)
async def import_procedure_to_study(study_id: str, procedure_data: StudyProcedureCreate):
    """Import a master procedure into a study with optional cost override."""
    # Verify study exists
    study = await db.studies.find_one({"id": study_id})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    # Get master procedure
    master_proc = await db.master_procedures.find_one({"id": procedure_data.master_procedure_id})
    if not master_proc:
        raise HTTPException(status_code=404, detail="Master procedure not found")
    
    # Create study procedure with snapshot of master procedure
    study_procedure = StudyProcedure(
        study_id=study_id,
        master_procedure_id=procedure_data.master_procedure_id,
        name=master_proc['name'],
        category=master_proc['category'],
        description=master_proc['description'],
        study_specific_cost=procedure_data.study_specific_cost,
        currency=master_proc['currency'],
        input_fields=master_proc['input_fields']
    )
    
    await db.study_procedures.insert_one(study_procedure.dict())
    return study_procedure

@api_router.get("/studies/{study_id}/procedures", response_model=List[StudyProcedure])
async def get_study_procedures(study_id: str):
    """Get all procedures imported into a study."""
    procedures = await db.study_procedures.find({"study_id": study_id}).to_list(1000)
    return [StudyProcedure(**to_dict(proc)) for proc in procedures]

# VISIT ENDPOINTS

@api_router.post("/visits", response_model=Visit)
async def create_visit(visit: VisitCreate):
    """Create a new visit for a study."""
    # Verify study exists
    study = await db.studies.find_one({"id": visit.study_id})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    
    # Verify cohorts exist
    for cohort_id in visit.cohort_ids:
        cohort = await db.cohorts.find_one({"id": cohort_id, "study_id": visit.study_id})
        if not cohort:
            raise HTTPException(status_code=404, detail=f"Cohort {cohort_id} not found in study")
    
    visit_dict = visit.dict()
    # Convert dates to strings for MongoDB storage
    if 'planned_date' in visit_dict and visit_dict['planned_date']:
        visit_dict['planned_date'] = visit_dict['planned_date'].isoformat()
    
    visit_obj = Visit(**visit.dict())
    visit_obj_dict = visit_obj.dict()
    if 'planned_date' in visit_obj_dict and isinstance(visit_obj_dict['planned_date'], date):
        visit_obj_dict['planned_date'] = visit_obj_dict['planned_date'].isoformat()
    if 'actual_date' in visit_obj_dict and isinstance(visit_obj_dict['actual_date'], date):
        visit_obj_dict['actual_date'] = visit_obj_dict['actual_date'].isoformat()
    
    await db.visits.insert_one(visit_obj_dict)
    return visit_obj

@api_router.get("/studies/{study_id}/visits", response_model=List[Visit])
async def get_study_visits(study_id: str):
    """Get all visits for a specific study."""
    visits = await db.visits.find({"study_id": study_id}).to_list(1000)
    return [Visit(**to_dict(visit)) for visit in visits]

@api_router.get("/visits/{visit_id}", response_model=Visit)
async def get_visit(visit_id: str):
    """Get a specific visit by ID."""
    visit = await db.visits.find_one({"id": visit_id})
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return Visit(**to_dict(visit))

@api_router.put("/visits/{visit_id}", response_model=Visit)
async def update_visit(visit_id: str, update_data: VisitUpdate):
    """Update a visit."""
    visit = await db.visits.find_one({"id": visit_id})
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items() if v is not None}
    # Convert dates to strings for MongoDB storage
    if 'planned_date' in update_dict and isinstance(update_dict['planned_date'], date):
        update_dict['planned_date'] = update_dict['planned_date'].isoformat()
    if 'actual_date' in update_dict and isinstance(update_dict['actual_date'], date):
        update_dict['actual_date'] = update_dict['actual_date'].isoformat()
    
    update_dict['updated_at'] = datetime.utcnow()
    
    await db.visits.update_one({"id": visit_id}, {"$set": update_dict})
    
    updated_visit = await db.visits.find_one({"id": visit_id})
    return Visit(**to_dict(updated_visit))

# VISIT PROCEDURE ASSIGNMENT ENDPOINTS

@api_router.post("/visits/{visit_id}/procedures", response_model=VisitProcedure)
async def assign_procedure_to_visit(visit_id: str, procedure_assignment: VisitProcedureCreate):
    """Assign a procedure to a visit."""
    # Verify visit exists
    visit = await db.visits.find_one({"id": visit_id})
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    # Verify study procedure exists
    study_proc = await db.study_procedures.find_one({"id": procedure_assignment.study_procedure_id})
    if not study_proc:
        raise HTTPException(status_code=404, detail="Study procedure not found")
    
    visit_procedure = VisitProcedure(
        visit_id=visit_id,
        **procedure_assignment.dict()
    )
    
    await db.visit_procedures.insert_one(visit_procedure.dict())
    return visit_procedure

@api_router.get("/visits/{visit_id}/procedures", response_model=List[VisitProcedure])
async def get_visit_procedures(visit_id: str):
    """Get all procedures assigned to a visit."""
    procedures = await db.visit_procedures.find({"visit_id": visit_id}).to_list(1000)
    return [VisitProcedure(**to_dict(proc)) for proc in procedures]

# COST CALCULATION ENDPOINTS

@api_router.get("/visits/{visit_id}/cost")
async def calculate_visit_cost(visit_id: str):
    """Calculate total cost for a visit."""
    # Get visit and its cohorts
    visit = await db.visits.find_one({"id": visit_id})
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    # Get visit procedures
    visit_procedures = await db.visit_procedures.find({"visit_id": visit_id}).to_list(1000)
    
    total_cost = 0
    total_animals = 0
    
    # Get animal count from cohorts
    for cohort_id in visit.get('cohort_ids', []):
        cohort = await db.cohorts.find_one({"id": cohort_id})
        if cohort:
            total_animals += len(cohort.get('animal_ids', []))
    
    # Calculate procedure costs
    for visit_proc in visit_procedures:
        study_proc = await db.study_procedures.find_one({"id": visit_proc['study_procedure_id']})
        if study_proc:
            cost_per_animal = study_proc.get('study_specific_cost') or study_proc.get('default_cost', 0)
            total_cost += cost_per_animal * total_animals
    
    return {
        "visit_id": visit_id,
        "total_cost": total_cost,
        "currency": "USD",
        "total_animals": total_animals,
        "procedure_count": len(visit_procedures)
    }

@api_router.get("/studies/{study_id}/cost")
async def calculate_study_cost(study_id: str):
    """Calculate total cost for an entire study."""
    # Get all visits for the study
    visits = await db.visits.find({"study_id": study_id}).to_list(1000)
    
    total_study_cost = 0
    visit_costs = []
    
    for visit in visits:
        visit_cost_response = await calculate_visit_cost(visit['id'])
        visit_costs.append({
            "visit_id": visit['id'],
            "visit_name": visit['name'],
            "cost": visit_cost_response['total_cost']
        })
        total_study_cost += visit_cost_response['total_cost']
    
    return {
        "study_id": study_id,
        "total_cost": total_study_cost,
        "currency": "USD",
        "visit_costs": visit_costs
    }

# Original status check endpoints (keeping existing functionality)
@api_router.get("/")
async def root():
    return {"message": "Preclinical Research Management API v2.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database connection management
@app.on_event("startup")
async def startup_event():
    global client, db
    print(f"Connecting to MongoDB at: {MONGO_URL}")
    print(f"Database name: {DB_NAME}")
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Test the connection
        await client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Create indexes for better performance
        await db.master_procedures.create_index("id", unique=True)
        await db.animals.create_index("id", unique=True)
        await db.animals.create_index("animal_id")
        await db.studies.create_index("id", unique=True)
        await db.status_checks.create_index("timestamp")
        await db.cohorts.create_index("id", unique=True)
        await db.visits.create_index("id", unique=True)
        await db.study_procedures.create_index("id", unique=True)
        await db.visit_procedures.create_index("id", unique=True)
        
        print("✅ Database indexes created")
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print("\n💡 Make sure MongoDB is running or check your MONGO_URL")
        print("   For local MongoDB: mongodb://localhost:27017")
        print("   For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")
