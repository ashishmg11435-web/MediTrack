# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from schemas import UserCreate
from database import get_db, SessionLocal, engine, Base
from models import User
from routes import router
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

# This runs before the server starts accepting requests
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to the DB and create the tables based on models.py
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield  # The server is now running

# Pass the lifespan to the app
app = FastAPI(lifespan=lifespan)

# Add CORS middleware to allow the React frontend to communicate with the API
origins = [
    "https://medi-track-ochre.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def read_root():
    return {"message": "Server is alive!"}



