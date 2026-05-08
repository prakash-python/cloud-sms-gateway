from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..websocket.manager import manager

router = APIRouter()

@router.post("/register", response_model=schemas.Device)
def register_device(device_data: schemas.DeviceCreate, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_data.device_id).first()
    if db_device:
        # Update existing device info
        db_device.model = device_data.model
        db_device.android_version = device_data.android_version
        db.commit()
        db.refresh(db_device)
        return db_device
    
    new_device = models.Device(**device_data.dict())
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device

@router.get("/", response_model=list[schemas.Device])
def list_devices(db: Session = Depends(get_db)):
    devices = db.query(models.Device).all()
    # Sync with WebSocket manager for real-time status
    online_ids = manager.active_connections.keys()
    for dev in devices:
        dev.is_online = dev.device_id in online_ids
    return devices
