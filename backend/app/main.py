from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import logging

from .database import engine, Base, get_db
from .websocket.manager import manager
from .models import models
from .routes import auth, sms, devices

# Create database tables
Base.metadata.create_all(bind=engine)

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
app.include_router(sms.router, prefix="/api/sms", tags=["SMS Management"])
app.include_router(devices.router, prefix="/api/devices", tags=["Device Management"])

@app.get("/")
async def root():
    return {"message": "Cloud SMS Gateway API is running"}

@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str, db: Session = Depends(get_db)):
    await manager.connect(device_id, websocket)
    
    # Update device status in DB
    device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
    if device:
        device.is_online = True
        db.commit()

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle incoming messages from Android (e.g., delivery reports)
            if message.get("type") == "DELIVERY_REPORT":
                log_id = message["data"].get("log_id")
                status = message["data"].get("status")
                
                sms_log = db.query(models.SMSLog).filter(models.SMSLog.id == log_id).first()
                if sms_log:
                    sms_log.status = status
                    db.commit()
                    
            elif message.get("type") == "HEARTBEAT":
                pass # Just keep connection alive
                
    except WebSocketDisconnect:
        manager.disconnect(device_id)
        # Update device status in DB
        device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
        if device:
            device.is_online = False
            db.commit()
    except Exception as e:
        logging.error(f"WebSocket error for {device_id}: {e}")
        manager.disconnect(device_id)
