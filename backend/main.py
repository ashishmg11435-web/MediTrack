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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (update this to your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)

@app.get("/")
async def read_root():
    return {"message": "Server is alive!"}



