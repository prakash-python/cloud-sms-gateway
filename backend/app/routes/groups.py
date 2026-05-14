from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
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
    groups = db.query(models.ContactGroup).filter(models.ContactGroup.owner_id == current_user.id).all()
    # Populate contact_count for each group
    for group in groups:
        group.contact_count = len(group.contacts)
    return groups

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
    
    full_name = contact.full_name
    if not full_name:
        # Mocking name extraction logic
        # In a real app, you might call a Truecaller API or similar
        # For now, we'll just use a placeholder or logic based on number
        if contact.phone_number.startswith("+91"):
            full_name = f"User {contact.phone_number[-4:]}" # Mock name
        else:
            full_name = "Unknown Contact"

    db_contact = models.Contact(
        group_id=group_id,
        phone_number=contact.phone_number,
        full_name=full_name,
        email=contact.email
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.put("/contacts/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, contact_update: schemas.ContactUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if contact exists and belongs to a group owned by the user
    db_contact = db.query(models.Contact).join(models.ContactGroup).filter(
        models.Contact.id == contact_id, 
        models.ContactGroup.owner_id == current_user.id
    ).first()
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    update_data = contact_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contact, key, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_contact = db.query(models.Contact).join(models.ContactGroup).filter(
        models.Contact.id == contact_id, 
        models.ContactGroup.owner_id == current_user.id
    ).first()
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    
    db.delete(db_contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

@router.post("/import/csv", response_model=schemas.ContactGroup)
async def import_contacts_csv(
    name: str = Form(...),
    description: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Read file based on extension
        contents = await file.read()
        filename = file.filename.lower()
        
        if filename.endswith('.csv'):
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError:
                # Fallback for different encodings
                df = pd.read_csv(io.BytesIO(contents), encoding='latin1')
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .csv or .xlsx")
        
        # Clean column names
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Look for phone and name columns
        phone_col = next((c for c in df.columns if 'phone' in c or 'mobile' in c or 'number' in c), None)
        name_col = next((c for c in df.columns if 'name' in c or 'full' in c or 'contact' in c), None)
        
        if not phone_col:
            raise HTTPException(status_code=400, detail="Could not find a phone number column in CSV. Please ensure your header contains 'phone' or 'number'.")
        
        # Create group
        new_group = models.ContactGroup(
            name=name,
            description=description or f"Imported from {file.filename}",
            owner_id=current_user.id,
            source_type="CSV"
        )
        db.add(new_group)
        db.commit()
        db.refresh(new_group)
        
        # Add contacts
        contacts = []
        for _, row in df.iterrows():
            phone = str(row[phone_col]).strip()
            # Basic phone cleanup (remove .0 if float)
            if phone.endswith('.0'): phone = phone[:-2]
            
            if not phone or phone == 'nan': continue
            
            contact_name = str(row[name_col]) if name_col and not pd.isna(row[name_col]) else "Contact"
            
            contacts.append(models.Contact(
                group_id=new_group.id,
                full_name=contact_name,
                phone_number=phone
            ))
            
        db.bulk_save_objects(contacts)
        db.commit()
        
        return new_group
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")
