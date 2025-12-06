import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Database URL from environment or default to local fallback
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://azlankhawar:azlan123@localhost:6000/azlan-db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def execute_raw_sql(query: str):
    with engine.connect() as connection:
        result = connection.execute(text(query))
        connection.commit()
        if result.returns_rows:
            keys = result.keys()
            return [dict(zip(keys, row)) for row in result]
        return {"message": "Query executed successfully"}
