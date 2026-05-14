from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import logging
import os

# Configure logging to both console and file
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

from .database import engine, Base, SessionLocal, get_db
from app.websocket.manager import manager
from .models import models
from .routes import auth, sms, devices, roles, sims, groups, campaigns

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
    device_id = device_id.lower()
    logger.info(f"MANAGER_ID[{id(manager)}] NEW CONNECTION ATTEMPT: {device_id}")
    await manager.connect(device_id, websocket)
    
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
                    device.sim_count = msg_data.get("sim_count", 1)
                    db.commit()
                    
                    # Sync SIM cards
                    for i in range(device.sim_count):
                        sim = db.query(models.SIMCard).filter(
                            models.SIMCard.device_id == device.id,
                            models.SIMCard.sim_slot == i
                        ).first()
                        if not sim:
                            new_sim = models.SIMCard(
                                device_id=device.id,
                                sim_slot=i,
                                carrier_name="Detecting...",
                                phone_number="Syncing...",
                                daily_limit=200
                            )
                            db.add(new_sim)
                    db.commit()
                    logging.info(f"Updated Device Info and synced SIMs for {device_id}")

            # Handle DELIVERY_REPORT
            elif msg_type == "DELIVERY_REPORT":
                log_id = msg_data.get("log_id")
                status = msg_data.get("status")
                slot = msg_data.get("sim_slot", 0) # Android app should report which slot it used
                
                # Update SIM usage if successful
                if status in ["SENT", "DELIVERED"]:
                    sim = db.query(models.SIMCard).filter(
                        models.SIMCard.device_id == device.id,
                        models.SIMCard.sim_slot == slot
                    ).first()
                    if sim:
                        sim.sms_sent_today += 1
                        db.commit()

                # 1. Check if it's a standard SMS log
                sms_log = db.query(models.SMSLog).filter(models.SMSLog.id == log_id).first()
                if sms_log:
                    sms_log.status = status
                    db.commit()
                    logging.info(f"Standard SMS report for {log_id}: {status} on SIM {slot}")
                
                # 2. Check if it's a Campaign Recipient (used for group SMS)
                recipient = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.id == log_id).first()
                if recipient:
                    recipient.status = status
                    
                    # Update campaign totals
                    campaign = db.query(models.Campaign).filter(models.Campaign.id == recipient.campaign_id).first()
                    if campaign:
                        if status == "SENT" or status == "DELIVERED":
                            campaign.sent_messages += 1
                        elif status == "FAILED":
                            campaign.failed_messages += 1
                        
                        # Check if finished
                        if campaign.sent_messages + campaign.failed_messages >= campaign.total_messages:
                            campaign.status = "COMPLETED"
                    db.commit()
                    logging.info(f"Campaign recipient report for {log_id}: {status} on SIM {slot}")
                    
            elif msg_type == "CAMPAIGN_PROGRESS":
                campaign_id = msg_data.get("campaign_id")
                recipient_id = msg_data.get("recipient_id")
                status = msg_data.get("status")
                
                # Update recipient status
                recipient = db.query(models.CampaignRecipient).filter(models.CampaignRecipient.id == recipient_id).first()
                if recipient:
                    recipient.status = status
                    
                    # Update campaign totals
                    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
                    if campaign:
                        if status == "SENT" or status == "DELIVERED":
                            campaign.sent_messages += 1
                        elif status == "FAILED":
                            campaign.failed_messages += 1
                        
                        # Check if finished
                        if campaign.sent_messages + campaign.failed_messages >= campaign.total_messages:
                            campaign.status = "COMPLETED"
                    db.commit()
                    logging.info(f"Campaign {campaign_id} progress: {status} for recipient {recipient_id}")

            elif msg_type == "HEARTBEAT":
                # Just update battery if provided and keep alive
                device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
                if device:
                    if "battery_level" in msg_data:
                        device.battery_level = msg_data["battery_level"]
                    db.commit()
                
    except WebSocketDisconnect:
        logger.warning(f"MANAGER_ID[{id(manager)}] Device DISCONNECTED: {device_id}")
        manager.disconnect(device_id)
        device = db.query(models.Device).filter(models.Device.device_id == device_id).first()
        if device:
            device.is_online = False
            db.commit()
    except Exception as e:
        logger.error(f"MANAGER_ID[{id(manager)}] WebSocket error for {device_id}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        manager.disconnect(device_id)

