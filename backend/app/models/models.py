from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    devices = relationship("Device", back_populates="owner")
    campaigns = relationship("Campaign", back_populates="owner")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False) # Hardware ID or FCM token
    model = Column(String)
    android_version = Column(String)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="devices")
    sms_logs = relationship("SMSLog", back_populates="device")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    message_template = Column(Text, nullable=False)
    status = Column(String, default="PENDING") # PENDING, RUNNING, COMPLETED, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="campaigns")
    recipients = relationship("CampaignRecipient", back_populates="campaign")

class CampaignRecipient(Base):
    __tablename__ = "campaign_recipients"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    phone_number = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, SENT, FAILED, DELIVERED
    sent_at = Column(DateTime(timezone=True))
    
    campaign = relationship("Campaign", back_populates="recipients")

class SMSLog(Base):
    __tablename__ = "sms_logs"
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="PENDING") # PENDING, SENT, FAILED, DELIVERED
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    device_id = Column(Integer, ForeignKey("devices.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    device = relationship("Device", back_populates="sms_logs")
