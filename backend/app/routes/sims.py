from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth.utils import get_current_user

router = APIRouter()

@router.get("/{device_id}", response_model=List[schemas.SIMCard])
def get_device_sims(device_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    device = db.query(models.Device).filter(models.Device.id == device_id, models.Device.owner_id == current_user.id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device.sim_cards

@router.post("/configure", response_model=schemas.SIMCard)
def configure_sim(config: schemas.SIMCardCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    device = db.query(models.Device).filter(models.Device.id == config.device_id, models.Device.owner_id == current_user.id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db_sim = db.query(models.SIMCard).filter(
        models.SIMCard.device_id == config.device_id, 
        models.SIMCard.sim_slot == config.sim_slot
    ).first()
    
    if db_sim:
        for key, value in config.dict().items():
            setattr(db_sim, key, value)
    else:
        db_sim = models.SIMCard(**config.dict())
        db.add(db_sim)
        
    db.commit()
    db.refresh(db_sim)
    return db_sim

@router.get("/usage/analytics")
def get_usage_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sims = db.query(models.SIMCard).join(models.Device).filter(models.Device.owner_id == current_user.id).all()
    
    analytics = []
    for sim in sims:
        usage_pct = (sim.sms_sent_today / sim.daily_limit) * 100 if sim.daily_limit > 0 else 0
        analytics.append({
            "sim_id": sim.id,
            "device_id": sim.device_id,
            "sim_slot": sim.sim_slot,
            "phone": sim.phone_number,
            "carrier": sim.carrier_name,
            "sent": sim.sms_sent_today,
            "limit": sim.daily_limit,
            "usage_pct": usage_pct,
            "status": "DANGER" if usage_pct > 95 else "WARNING" if usage_pct > 80 else "OK"
        })
    return analytics
