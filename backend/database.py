# pyrefly: ignore [missing-import]
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# The new MySQL Connection String using aiomysql
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+aiomysql://root:Ashish%40123@localhost/meditrack")


# 1. Use create_async_engine instead of create_engine
engine = create_async_engine(DATABASE_URL, echo=True)

# 2. Tell the sessionmaker to generate AsyncSessions
SessionLocal = sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    autocommit=False, 
    autoflush=False
)

# 3. Base class for models remains the same
Base = declarative_base()

# 4. get_db must now be an async generator using 'async with'
async def get_db():
    async with SessionLocal() as db:
        yield db
