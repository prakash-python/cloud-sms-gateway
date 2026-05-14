from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user
from app.websocket.manager import manager
from typing import Optional
import logging

router = APIRouter()

@router.post("/send", response_model=schemas.SMSLog)
async def send_single_sms(
    sms_data: schemas.SMSCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Check if device is online via WebSocket manager
    online_devices = await manager.get_online_devices()
    if sms_data.device_id not in online_devices:
        raise HTTPException(status_code=400, detail="Target device is offline")

    # 2. Find device in DB
    device = db.query(models.Device).filter(models.Device.device_id == sms_data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # 3. Create SMS Log entry
    new_log = models.SMSLog(
        owner_id=current_user.id,
        phone_number=sms_data.phone_number,
        full_name=sms_data.full_name,
        message=sms_data.message,
        device_id=device.id,
        status="PENDING",
        source=sms_data.source
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 4. Dispatch to Android via WebSocket
    dispatched = await manager.send_sms_request(
        device_id=sms_data.device_id,
        phone_number=sms_data.phone_number,
        message=sms_data.message,
        log_id=new_log.id,
        sim_slot=sms_data.sim_slot
    )

    if dispatched:
        # Update SIM card stats
        sim = db.query(models.SIMCard).filter(
            models.SIMCard.device_id == device.id,
            models.SIMCard.sim_slot == sms_data.sim_slot
        ).first()
        if sim:
            sim.sms_sent_today += 1
            db.commit()
    else:
        new_log.status = "FAILED"
        new_log.error_message = "WebSocket dispatch failed"
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to reach device")

    return new_log

@router.get("/history", response_model=schemas.SMSHistoryResponse)
def get_sms_history(
    db: Session = Depends(get_db), 
    skip: int = 0, 
    limit: int = 10,
    source: Optional[str] = None,
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.SMSLog).filter(models.SMSLog.owner_id == current_user.id)
    if source:
        query = query.filter(models.SMSLog.source == source)
        
    total = query.count()
    logs = query.order_by(models.SMSLog.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "logs": logs}

@router.get("/stats")
def get_sms_stats(db: Session = Depends(get_db)):
    # Aggregated counts (Individual SMS + Campaign Recipients)
    total_individual = db.query(models.SMSLog).count()
    total_campaign = db.query(models.CampaignRecipient).count()
    total = total_individual + total_campaign
    
    delivered_individual = db.query(models.SMSLog).filter(models.SMSLog.status.in_(["DELIVERED", "SENT"])).count()
    delivered_campaign = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.status.in_(["DELIVERED", "SENT"])).count()
    delivered = delivered_individual + delivered_campaign
    
    failed_individual = db.query(models.SMSLog).filter(models.SMSLog.status == "FAILED").count()
    failed_campaign = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.status == "FAILED").count()
    failed = failed_individual + failed_campaign
    
    # Success rate
    success_rate = (delivered / total * 100) if total > 0 else 0
    
    # Get last 12 days activity (matching frontend graph)
    from datetime import datetime, timedelta
    activity = []
    for i in range(11, -1, -1):
        date = (datetime.now() - timedelta(days=i)).date()
        
        count_ind = db.query(models.SMSLog).filter(func.date(models.SMSLog.created_at) == date).count()
        count_camp = db.query(models.CampaignRecipient).filter(func.date(models.CampaignRecipient.created_at) == date).count()
        
        fail_ind = db.query(models.SMSLog).filter(func.date(models.SMSLog.created_at) == date, models.SMSLog.status == "FAILED").count()
        fail_camp = db.query(models.CampaignRecipient).filter(func.date(models.CampaignRecipient.created_at) == date, models.CampaignRecipient.status == "FAILED").count()
        
        activity.append({
            "name": f"Day {12-i}",
            "sent": count_ind + count_camp,
            "failed": fail_ind + fail_camp
        })
        
    return {
        "total": total,
        "delivered": delivered,
        "sent": delivered, # In UI, 'sent' often means successfully dispatched
        "failed": failed,
        "success_rate": f"{success_rate:.1f}%",
        "activity": activity
    }
