from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import inspect, text
from database import engine, execute_raw_sql

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "SQL Playground API is running"}

@app.post("/execute")
def execute_query(request: QueryRequest):
    try:
        # Basic security check (very minimal, this is a playground)
        # In a real app, we would never allow raw SQL execution like this
        result = execute_raw_sql(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/tables")
def get_tables():
    try:
        logger.info("Fetching tables...")
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Found tables: {tables}")
        table_details = []
        for table in tables:
            try:
                columns = []
                for column in inspector.get_columns(table):
                    columns.append({
                        "name": column["name"],
                        "type": str(column["type"])
                    })
                
                # Fetch sample data (first 5 rows)
                rows = []
                try:
                    with engine.connect() as connection:
                        result = connection.execute(text(f'SELECT * FROM "{table}" LIMIT 5'))
                        keys = result.keys()
                        rows = [dict(zip(keys, row)) for row in result]
                except Exception as db_err:
                    logger.warning(f"Could not fetch rows for table {table}: {db_err}")

                table_details.append({
                    "name": table,
                    "columns": columns,
                    "rows": rows
                })
            except Exception as inner_e:
                logger.error(f"Error inspecting table {table}: {inner_e}")
                continue
        return table_details
    except Exception as e:
        logger.error(f"Error fetching tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))
