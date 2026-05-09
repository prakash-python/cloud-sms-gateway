from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user
from ..websocket.manager import manager
import json

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

@router.post("/{campaign_id}/start")
async def start_campaign(campaign_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id, models.Campaign.owner_id == current_user.id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign.status = "RUNNING"
    db.commit()
    
    # Notify Android devices (Simple round-robin or first available logic)
    device = db.query(models.Device).filter(models.Device.owner_id == current_user.id, models.Device.is_online == True).first()
    if not device:
        campaign.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=400, detail="No online devices available to process campaign")
    
    # In a real production app, this would be handled by a task queue like Celery
    # For this demo, we'll send a bulk command via WebSocket
    recipients = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.campaign_id == campaign_id, models.CampaignRecipient.status == "PENDING").all()
    
    payload = {
        "type": "BULK_SMS",
        "campaign_id": campaign_id,
        "template": campaign.message_template,
        "recipients": [
            {"id": r.id, "phone": r.phone_number, "name": r.full_name} for r in recipients
        ]
    }
    
    await manager.send_personal_message(json.dumps(payload), device.device_id)
    
    return {"status": "started", "device": device.device_id}

@router.get("/", response_model=List[schemas.Campaign])
def get_campaigns(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Campaign).filter(models.Campaign.owner_id == current_user.id).all()
