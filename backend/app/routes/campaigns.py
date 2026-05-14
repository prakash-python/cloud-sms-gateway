from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import logging
import json
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user
from app.websocket.manager import manager

router = APIRouter()

@router.post("/", response_model=schemas.Campaign)
def create_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.ContactGroup).filter(models.ContactGroup.id == campaign.contact_group_id, models.ContactGroup.owner_id == current_user.id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Contact group not found")
    
    db_campaign = models.Campaign(
        **campaign.dict(), 
        owner_id=current_user.id,
        total_messages=len(group.contacts)
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    
    # Create recipients
    recipients = [
        models.CampaignRecipient(
            campaign_id=db_campaign.id,
            phone_number=c.phone_number,
            full_name=c.full_name
        ) for c in group.contacts
    ]
    db.bulk_save_objects(recipients)
    db.commit()
    
    return db_campaign

async def execute_campaign(campaign_id: int, device_id: str, db: Session):
    import re
    import asyncio
    
    # Use a new session for background task to avoid conflicts
    # Since we don't have a factory here, we'll use the existing db but be careful
    
    recipients = db.query(models.CampaignRecipient).filter(
        models.CampaignRecipient.campaign_id == campaign_id, 
        models.CampaignRecipient.status == "PENDING"
    ).all()
    
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not campaign:
        return

    for r in recipients:
        # Personalize message
        message = re.sub(r'\{\{\s*name\s*\}\}', r.full_name or "there", campaign.message_template, flags=re.IGNORECASE)
        
        # Dispatch via WebSocket
        dispatched = await manager.send_sms_request(
            device_id=device_id,
            phone_number=r.phone_number,
            message=message,
            log_id=r.id
        )
        
        # Small delay (1 second) to prevent carrier spam detection and device overload
        await asyncio.sleep(1.0)

@router.post("/{campaign_id}/start")
async def start_campaign(
    campaign_id: int, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Reset failed recipients to pending
    db.query(models.CampaignRecipient).filter(
        models.CampaignRecipient.campaign_id == campaign_id,
        models.CampaignRecipient.status == "FAILED"
    ).update({"status": "PENDING"})
    
    # Get user's online devices
    user_devices = db.query(models.Device).filter(models.Device.owner_id == current_user.id).all()
    online_device_ids = [did.lower() for did in await manager.get_online_devices()]
    
    device = None
    for d in user_devices:
        if d.device_id.lower() in online_device_ids:
            device = d
            break
            
    if not device:
        campaign.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=400, detail="No online devices available.")
    
    # Update status and start background task
    campaign.status = "RUNNING"
    campaign.failed_messages = 0
    db.commit()
    
    background_tasks.add_task(execute_campaign, campaign_id, device.device_id, db)
    
    return {"status": "started", "campaign": campaign.name}

@router.get("/", response_model=List[schemas.Campaign])
def get_campaigns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    campaigns = db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).all()
    # Inject source_type from linked group
    for c in campaigns:
        if c.contact_group:
            c.source_type = c.contact_group.source_type
    return campaigns

@router.get("/{campaign_id}/recipients", response_model=List[schemas.CampaignRecipient])
def get_campaign_recipients(campaign_id: int, status: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    query = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.campaign_id == campaign_id)
    if status:
        query = query.filter(models.CampaignRecipient.status == status)
    
    return query.all()

@router.put("/{campaign_id}", response_model=schemas.Campaign)
def update_campaign(campaign_id: int, campaign_update: schemas.CampaignUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # If group changes, update total messages
    update_data = campaign_update.dict(exclude_unset=True)
    if "contact_group_id" in update_data:
        group = db.query(models.ContactGroup).filter(models.ContactGroup.id == update_data["contact_group_id"], models.ContactGroup.owner_id == current_user.id).first()
        if not group:
            raise HTTPException(status_code=404, detail="New contact group not found")
        db_campaign.total_messages = len(group.contacts)
        
        # Optionally recreate recipients or keep old ones (simpler to keep for now unless explicit sync requested)
    
    for key, value in update_data.items():
        setattr(db_campaign, key, value)
    
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    db.delete(db_campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}
