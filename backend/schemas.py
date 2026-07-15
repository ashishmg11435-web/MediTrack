# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(max_length=100)

# Used for both creating and updating a profile
class PatientProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, description="Age in years", ge=0, le=150)
    blood_group: Optional[str] = Field(None, description="Blood group, e.g. A+, O-, AB+")
    height: Optional[float] = Field(None, description="Height in centimeters (cm)", gt=0, le=300)
    weight: Optional[float] = Field(None, description="Weight in kilograms (kg)", gt=0, le=500)
    allergies: Optional[str] = Field(None, description="Comma-separated list of known allergies")

# Used for returning the profile to the frontend
class PatientProfileResponse(PatientProfileUpdate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class MedicalRecordCreate(BaseModel):
    diagnosis: str
    doctor_name: str
    visit_date: date
    notes: Optional[str] = None

class MedicalRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    doctor_name: Optional[str] = None
    visit_date: Optional[date] = None
    notes: Optional[str] = None

class MedicalRecordResponse(MedicalRecordCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# ── Medicine Schemas ──

class MedicineCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class MedicineResponse(MedicineCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ── Appointment Schemas ──

class AppointmentCreate(BaseModel):
    doctor_name: str
    appointment_date: datetime
    reason: str

class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    doctor_name: str
    appointment_date: datetime
    reason: str
    status: str

    class Config:
        from_attributes = True


# ── Dashboard Schema ──

class DashboardSummary(BaseModel):
    total_medical_records: int
    active_medicines: int
    upcoming_appointments: int


# ── AI Integration Schemas ──

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

    



