from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..websocket.manager import manager
import logging

router = APIRouter()

@router.post("/send", response_model=schemas.SMSLog)
async def send_single_sms(sms_data: schemas.SMSCreate, db: Session = Depends(get_db)):
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
        phone_number=sms_data.phone_number,
        message=sms_data.message,
        device_id=device.id,
        status="PENDING"
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 4. Dispatch to Android via WebSocket
    dispatched = await manager.send_sms_request(
        device_id=sms_data.device_id,
        phone_number=sms_data.phone_number,
        message=sms_data.message,
        log_id=new_log.id
    )

    if not dispatched:
        new_log.status = "FAILED"
        new_log.error_message = "WebSocket dispatch failed"
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to reach device")

    return new_log

@router.get("/history", response_model=list[schemas.SMSLog])
def get_sms_history(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    logs = db.query(models.SMSLog).offset(skip).limit(limit).all()
    return logs
