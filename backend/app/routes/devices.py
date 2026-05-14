from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user
from app.websocket.manager import manager
import logging

router = APIRouter()

@router.post("/register", response_model=schemas.Device)
def register_device(device_data: schemas.DeviceCreate, db: Session = Depends(get_db)):
    db_device = db.query(models.Device).filter(models.Device.device_id == device_data.device_id).first()
    if db_device:
        # Update existing device info
        db_device.device_name = device_data.device_name
        db_device.phone_model = device_data.phone_model
        db_device.android_version = device_data.android_version
        db_device.sim_count = device_data.sim_count
        db.commit()
        db.refresh(db_device)
        return db_device
    
    new_device = models.Device(**device_data.dict())
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device

@router.get("/", response_model=list[schemas.Device])
def list_devices(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Filter by owner
    devices = db.query(models.Device).filter(models.Device.owner_id == current_user.id).all()
    
    # Also show unclaimed devices (optional, for onboarding)
    unclaimed = db.query(models.Device).filter(models.Device.owner_id == None).all()
    
    all_visible = list(devices) + list(unclaimed)
    
    # Sync with WebSocket manager for real-time status (Case-insensitive check)
    logging.info(f"MANAGER_ID_CHECK[{id(manager)}] Active connections in route: {len(manager.active_connections)}")
    online_ids = [k.lower() for k in manager.active_connections.keys()]
    for dev in all_visible:
        dev.is_online = dev.device_id.lower() in online_ids
    return all_visible

@router.post("/{device_id}/claim")
def claim_device(device_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logging.info(f"Attempting to claim device with internal ID: {device_id}")
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        logging.warning(f"Device with ID {device_id} not found in DB")
        raise HTTPException(status_code=404, detail=f"Device with ID {device_id} not found")
    
    if device.owner_id and device.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Device already owned by another user")
        
    device.owner_id = current_user.id
    
    # Also link all existing SIMs of this device to this user (if they aren't already)
    # Actually SIMs are linked to Device ID, and Sims route filters via Device.owner_id
    # So just setting Device.owner_id is enough.
    
    db.commit()
    return {"message": "Device claimed successfully"}
