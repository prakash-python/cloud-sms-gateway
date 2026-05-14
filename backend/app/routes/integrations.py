from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text, create_engine
from typing import List, Dict, Any
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user
import logging

router = APIRouter()

def get_engine_url(config):
    if config.connection_url:
        # Use direct URL
        url = config.connection_url
        # Automatically add sslmode for postgres if missing
        if "postgresql" in url and "sslmode" not in url:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}sslmode=require"
        return url, {'connect_timeout': 5}
    
    # Construct dynamic URL
    if config.db_type == "postgresql":
        url = f"postgresql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}?sslmode=require"
        connect_args = {'connect_timeout': 5}
    elif config.db_type == "mysql":
        url = f"mysql+pymysql://{config.username}:{config.password}@{config.host}:{config.port}/{config.database_name}"
        connect_args = {'connect_timeout': 5}
    else:
        raise HTTPException(status_code=400, detail="Unsupported database type")
    return url, connect_args

@router.post("/db/test")
def test_db_connection(config: schemas.DBConnectionCreate):
    try:
        url, connect_args = get_engine_url(config)
        engine = create_engine(url, connect_args=connect_args)
        with engine.connect() as conn:
            # Check if table exists
            conn.execute(text(f"SELECT 1 FROM {config.table_name} LIMIT 1"))
        return {"status": "success", "message": "Connection successful"}
    except Exception as e:
        logging.error(f"DB Test failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

@router.post("/db/tables")
def list_db_tables(config: schemas.DBConnectionCreate):
    try:
        url, connect_args = get_engine_url(config)
        engine = create_engine(url, connect_args=connect_args)
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to list tables: {str(e)}")

@router.post("/db/columns")
def list_db_columns(config: schemas.DBConnectionCreate):
    try:
        url, connect_args = get_engine_url(config)
        engine = create_engine(url, connect_args=connect_args)
        from sqlalchemy import inspect
        inspector = inspect(engine)
        columns = [c['name'] for c in inspector.get_columns(config.table_name)]
        return columns
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to list columns: {str(e)}")

@router.post("/db/save", response_model=schemas.DBConnection)
def save_db_connection(config: schemas.DBConnectionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if exists for this user
    db_conn = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.owner_id == current_user.id).first()
    
    if not db_conn:
        db_conn = models.DatabaseConnection(owner_id=current_user.id)
        db.add(db_conn)
    
    db_conn.db_type = config.db_type
    db_conn.host = config.host
    db_conn.port = config.port
    db_conn.database_name = config.database_name
    db_conn.username = config.username
    db_conn.encrypted_password = config.password # In production, encrypt this
    db_conn.connection_url = config.connection_url
    db_conn.table_name = config.table_name
    db_conn.phone_column = config.phone_column
    db_conn.first_name_column = config.first_name_column
    db_conn.last_name_column = config.last_name_column
    
    db.commit()
    db.refresh(db_conn)
    return db_conn

@router.get("/db/config", response_model=schemas.DBConnection)
def get_db_config(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_conn = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.owner_id == current_user.id).first()
    if not db_conn:
        raise HTTPException(status_code=404, detail="No DB configuration found")
    return db_conn

@router.get("/db/fetch")
def fetch_external_data(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_conn = db.query(models.DatabaseConnection).filter(models.DatabaseConnection.owner_id == current_user.id).first()
    if not db_conn:
        raise HTTPException(status_code=404, detail="No DB configuration found")
    
    try:
        # Use existing config object to build URL via helper
        url, connect_args = get_engine_url(db_conn)
        engine = create_engine(url, connect_args=connect_args)
        
        # Build columns list
        cols = [db_conn.phone_column]
        if db_conn.first_name_column:
            cols.append(db_conn.first_name_column)
        if db_conn.last_name_column:
            cols.append(db_conn.last_name_column)
            
        cols_str = ", ".join(cols)
        query = f"SELECT {cols_str} FROM {db_conn.table_name}"
        
        results = []
        with engine.connect() as conn:
            proxy = conn.execute(text(query))
            for row in proxy:
                # Map row to a dict
                row_dict = {}
                row_dict['phone'] = str(getattr(row, db_conn.phone_column))
                
                name_parts = []
                if db_conn.first_name_column:
                    name_parts.append(str(getattr(row, db_conn.first_name_column)))
                if db_conn.last_name_column:
                    name_parts.append(str(getattr(row, db_conn.last_name_column)))
                
                row_dict['name'] = " ".join(name_parts) if name_parts else "N/A"
                results.append(row_dict)
                
        return results
    except Exception as e:
        logging.error(f"Fetch failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch data: {str(e)}")
