from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.ContactGroup)
def create_group(group: schemas.ContactGroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_group = models.ContactGroup(**group.dict(), owner_id=current_user.id)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.get("/", response_model=List[schemas.ContactGroup])
def get_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.ContactGroup).filter(models.ContactGroup.owner_id == current_user.id).all()

@router.get("/{group_id}", response_model=schemas.ContactGroupWithContacts)
def get_group(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.ContactGroup).filter(models.ContactGroup.id == group_id, models.ContactGroup.owner_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.post("/{group_id}/contacts", response_model=schemas.Contact)
def add_contact(group_id: int, contact: schemas.ContactBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.ContactGroup).filter(models.ContactGroup.id == group_id, models.ContactGroup.owner_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    db_contact = models.Contact(**contact.dict(), group_id=group_id)
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.post("/import/csv")
async def import_csv(group_name: str, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    
    # Simple validation
    if 'phone' not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must contain a 'phone' column")
    
    # Create group
    db_group = models.ContactGroup(name=group_name, owner_id=current_user.id, source_type="CSV")
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    contacts = []
    duplicates = 0
    invalid = 0
    
    for _, row in df.iterrows():
        phone = str(row['phone']).strip()
        if not phone.isdigit() or len(phone) < 10:
            invalid += 1
            continue
            
        contacts.append(models.Contact(
            group_id=db_group.id,
            full_name=str(row.get('name', '')),
            phone_number=phone,
            email=str(row.get('email', '')) if 'email' in row else None
        ))
        
    db.bulk_save_objects(contacts)
    db.commit()
    
    return {
        "group_id": db_group.id,
        "total": len(df),
        "imported": len(contacts),
        "invalid": invalid,
        "duplicates": duplicates
    }
