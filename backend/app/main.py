from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import logging

from .database import engine, Base, SessionLocal, get_db
from .websocket.manager import manager
from .models import models
from .routes import auth, sms, devices, roles, sims, groups, campaigns
import logging

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed default roles
def seed_roles():
    db = SessionLocal()
    default_roles = [
        {"name": "admin", "description": "Administrator with full system access"},
        {"name": "staff", "description": "Staff member for operational tasks"},
        {"name": "support", "description": "Support representative"},
        {"name": "customer", "description": "Standard platform customer"},
    ]
    for role_data in default_roles:
        role = db.query(models.Role).filter(models.Role.name == role_data["name"]).first()
        if not role:
            db.add(models.Role(**role_data))
    db.commit()
    db.close()

seed_roles()

app = FastAPI(title="Cloud SMS Gateway API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(roles.router, prefix="/api/roles", tags=["Roles"])
app.include_router(sms.router, prefix="/api/sms", tags=["SMS"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(sims.router, prefix="/api/sims", tags=["SIM Management"])
app.include_router(groups.router, prefix="/api/groups", tags=["Group Management"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])

@app.get("/")
async def root():
    return {"message": "Cloud SMS Gateway API is running"}

@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str, db: Session = Depends(get_db)):
    await manager.connect(device_id, websocket)
    logging.info(f"Device connected via WS: {device_id}")
    
    # 1. Immediate Sync/Create Device in DB
    device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if not device:
        device = models.Device(device_id=device_id, is_online=True)
        db.add(device)
    else:
        device.is_online = True
    db.commit()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")
            msg_data = message.get("data", {})
            
            # Handle DEVICE_INFO (Sent on app startup/connect)
            if msg_type == "DEVICE_INFO":
                device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
                if device:
                    device.device_name = msg_data.get("device_name")
                    device.phone_model = msg_data.get("phone_model")
                    device.android_version = msg_data.get("android_version")
                    device.battery_level = msg_data.get("battery_level")
                    device.sim_count = msg_data.get("sim_count")
                    db.commit()
                    logging.info(f"Updated Device Info for {device_id}")

            # Handle DELIVERY_REPORT
            elif msg_type == "DELIVERY_REPORT":
                log_id = msg_data.get("log_id")
                status = msg_data.get("status")
                sms_log = db.query(models.SMSLog).filter(models.SMSLog.id == log_id).first()
                if sms_log:
                    sms_log.status = status
                    db.commit()
                    logging.info(f"Delivery report for {log_id}: {status}")
                    
            elif msg_type == "HEARTBEAT":
                # Just update battery if provided and keep alive
                device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
                if device:
                    if "battery_level" in msg_data:
                        device.battery_level = msg_data["battery_level"]
                    db.commit()
                
    except WebSocketDisconnect:
        manager.disconnect(device_id)
        logging.info(f"Device disconnected: {device_id}")
        device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
        if device:
            device.is_online = False
            db.commit()
    except Exception as e:
        logging.error(f"WebSocket error for {device_id}: {e}")
        manager.disconnect(device_id)

