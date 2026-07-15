# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, Query
# pyrefly: ignore [missing-import]
from sqlalchemy import select, func
from schemas import (
    UserCreate, UserLogin,
    PatientProfileUpdate, PatientProfileResponse,
    MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse,
    MedicineCreate, MedicineUpdate, MedicineResponse,
    AppointmentCreate, AppointmentResponse,
    DashboardSummary, ChatRequest, ChatResponse
)
from database import get_db, SessionLocal
from models import User, PatientProfile, MedicalRecord, Medicine, Appointment
from auth import get_password_hash, verify_password, create_access_token, get_current_user
# pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm
from datetime import date, datetime
from typing import Optional
import os
# pyrefly: ignore [missing-import]
import groq

router = APIRouter()


# ╔══════════════════════════════════════════════════════════╗
# ║                   AUTH  ENDPOINTS                        ║
# ╚══════════════════════════════════════════════════════════╝

@router.post("/auth/register")
async def register(user_data: UserCreate, db: SessionLocal = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "User created successfully"}


@router.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):
    result = await db.execute(select(User).filter(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


@router.delete("/users/me")
async def delete_user_me(
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted successfully"}


# ╔══════════════════════════════════════════════════════════╗
# ║                  PROFILE  ENDPOINTS                      ║
# ╚══════════════════════════════════════════════════════════╝

@router.get("/profile", response_model=PatientProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: SessionLocal = Depends(get_db)):
    result = await db.execute(select(PatientProfile).filter(PatientProfile.user_id == current_user.id))
    profile = result.scalars().first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("/profile", response_model=PatientProfileResponse)
async def update_profile(
    profile_data: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(select(PatientProfile).filter(PatientProfile.user_id == current_user.id))
    profile = result.scalars().first()

    if profile:
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
    else:
        profile = PatientProfile(
            user_id=current_user.id,
            **profile_data.model_dump()
        )
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return profile


# ╔══════════════════════════════════════════════════════════╗
# ║             MEDICAL RECORDS  ENDPOINTS                   ║
# ╚══════════════════════════════════════════════════════════╝

@router.post("/records", response_model=MedicalRecordResponse)
async def create_record(
    record_data: MedicalRecordCreate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    new_record = MedicalRecord(
        user_id=current_user.id,
        **record_data.model_dump()
    )
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record


@router.get("/records", response_model=list[MedicalRecordResponse])
async def get_records(
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db),
    # ── Filtering ──
    doctor_name: Optional[str] = Query(None),
    diagnosis: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    # ── Pagination ──
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    query = select(MedicalRecord).filter(MedicalRecord.user_id == current_user.id)

    # Apply filters
    if doctor_name:
        query = query.filter(MedicalRecord.doctor_name.ilike(f"%{doctor_name}%"))
    if diagnosis:
        query = query.filter(MedicalRecord.diagnosis.ilike(f"%{diagnosis}%"))
    if start_date:
        query = query.filter(MedicalRecord.visit_date >= start_date)
    if end_date:
        query = query.filter(MedicalRecord.visit_date <= end_date)

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/records/{record_id}", response_model=MedicalRecordResponse)
async def get_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(MedicalRecord).filter(
            MedicalRecord.id == record_id,
            MedicalRecord.user_id == current_user.id
        )
    )
    record = result.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    return record


@router.put("/records/{record_id}", response_model=MedicalRecordResponse)
async def update_record(
    record_id: int,
    record_data: MedicalRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(MedicalRecord).filter(
            MedicalRecord.id == record_id,
            MedicalRecord.user_id == current_user.id
        )
    )
    record = result.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    for key, value in record_data.model_dump(exclude_unset=True).items():
        setattr(record, key, value)

    await db.commit()
    await db.refresh(record)
    return record


@router.delete("/records/{record_id}")
async def delete_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(MedicalRecord).filter(
            MedicalRecord.id == record_id,
            MedicalRecord.user_id == current_user.id
        )
    )
    record = result.scalars().first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")

    await db.delete(record)
    await db.commit()
    return {"message": "Medical record deleted successfully"}


# ╔══════════════════════════════════════════════════════════╗
# ║               MEDICINE  ENDPOINTS                        ║
# ╚══════════════════════════════════════════════════════════╝

@router.post("/medicines", response_model=MedicineResponse)
async def create_medicine(
    medicine_data: MedicineCreate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    new_medicine = Medicine(
        user_id=current_user.id,
        **medicine_data.model_dump()
    )
    db.add(new_medicine)
    await db.commit()
    await db.refresh(new_medicine)
    return new_medicine


@router.get("/medicines", response_model=list[MedicineResponse])
async def get_medicines(
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(Medicine).filter(Medicine.user_id == current_user.id)
    )
    return result.scalars().all()


@router.put("/medicines/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(Medicine).filter(
            Medicine.id == medicine_id,
            Medicine.user_id == current_user.id
        )
    )
    medicine = result.scalars().first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    for key, value in medicine_data.model_dump(exclude_unset=True).items():
        setattr(medicine, key, value)

    await db.commit()
    await db.refresh(medicine)
    return medicine


@router.delete("/medicines/{medicine_id}")
async def delete_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(Medicine).filter(
            Medicine.id == medicine_id,
            Medicine.user_id == current_user.id
        )
    )
    medicine = result.scalars().first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    await db.delete(medicine)
    await db.commit()
    return {"message": "Medicine deleted successfully"}


# ╔══════════════════════════════════════════════════════════╗
# ║             APPOINTMENT  ENDPOINTS                       ║
# ╚══════════════════════════════════════════════════════════╝

@router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    new_appointment = Appointment(
        user_id=current_user.id,
        doctor_name=appointment_data.doctor_name,
        appointment_date=appointment_data.appointment_date,
        reason=appointment_data.reason,
        status="SCHEDULED"
    )
    db.add(new_appointment)
    await db.commit()
    await db.refresh(new_appointment)
    return new_appointment


@router.get("/appointments", response_model=list[AppointmentResponse])
async def get_appointments(
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(Appointment).filter(Appointment.user_id == current_user.id)
    )
    return result.scalars().all()


@router.patch("/appointments/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    result = await db.execute(
        select(Appointment).filter(
            Appointment.id == appointment_id,
            Appointment.user_id == current_user.id
        )
    )
    appointment = result.scalars().first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")

    appointment.status = "CANCELLED"
    await db.commit()
    await db.refresh(appointment)
    return appointment


# ╔══════════════════════════════════════════════════════════╗
# ║              DASHBOARD  ENDPOINT                         ║
# ╚══════════════════════════════════════════════════════════╝

@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    # Total medical records
    records_result = await db.execute(
        select(func.count(MedicalRecord.id)).filter(MedicalRecord.user_id == current_user.id)
    )
    total_records = records_result.scalar() or 0

    # Active medicines (end_date is NULL or in the future)
    medicines_result = await db.execute(
        select(func.count(Medicine.id)).filter(
            Medicine.user_id == current_user.id,
            (Medicine.end_date == None) | (Medicine.end_date >= date.today())
        )
    )
    active_medicines = medicines_result.scalar() or 0

    # Upcoming appointments (SCHEDULED and in the future)
    appointments_result = await db.execute(
        select(func.count(Appointment.id)).filter(
            Appointment.user_id == current_user.id,
            Appointment.status == "SCHEDULED",
            Appointment.appointment_date >= datetime.now()
        )
    )
    upcoming_appointments = appointments_result.scalar() or 0

    return DashboardSummary(
        total_medical_records=total_records,
        active_medicines=active_medicines,
        upcoming_appointments=upcoming_appointments
    )


# ╔══════════════════════════════════════════════════════════╗
# ║                  AI  ENDPOINTS                           ║
# ╚══════════════════════════════════════════════════════════╝

@router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: SessionLocal = Depends(get_db)
):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    # Fetch user's profile and active medicines to provide context to the AI
    profile_result = await db.execute(select(PatientProfile).filter(PatientProfile.user_id == current_user.id))
    profile = profile_result.scalars().first()

    medicines_result = await db.execute(
        select(Medicine).filter(
            Medicine.user_id == current_user.id,
            (Medicine.end_date == None) | (Medicine.end_date >= date.today())
        )
    )
    medicines = medicines_result.scalars().all()

    # Build context string
    context_str = f"User Name: {current_user.name}\n"
    if profile:
        context_str += f"Age: {profile.age or 'Unknown'}\n"
        context_str += f"Blood Group: {profile.blood_group or 'Unknown'}\n"
        context_str += f"Allergies: {profile.allergies or 'None reported'}\n"
    else:
        context_str += "Profile: No profile data provided yet.\n"

    if medicines:
        context_str += "Active Medicines:\n"
        for med in medicines:
            context_str += f"- {med.name} ({med.dosage}, {med.frequency})\n"
    else:
        context_str += "Active Medicines: None\n"

    system_prompt = f"""You are a helpful, empathetic, and knowledgeable AI Health Assistant integrated into the MediTrack personal health record app.
You have access to the user's basic health context to provide personalized advice.
Here is the user's current context:
{context_str}

CRITICAL INSTRUCTIONS:
1. You are NOT a doctor. You must explicitly state a brief disclaimer that your advice is for informational purposes only and they should consult a real doctor for serious issues. Do this naturally.
2. Use the provided context (like their allergies or active medicines) if it is relevant to their question.
3. Keep your answers concise, clear, and well-formatted (use bullet points if helpful).
"""

    messages_to_send = [{"role": "system", "content": system_prompt}]
    for msg in request.messages:
        messages_to_send.append({"role": msg.role, "content": msg.content})

    try:
        client = groq.Groq(api_key=groq_api_key)
        chat_completion = client.chat.completions.create(
            messages=messages_to_send,
            model="openai/gpt-oss-120b",
        )
        reply = chat_completion.choices[0].message.content
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI: {str(e)}")
