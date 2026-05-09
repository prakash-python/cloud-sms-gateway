from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    country = Column(String, nullable=False)
    company_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="users")
    
    devices = relationship("Device", back_populates="owner")
    contact_groups = relationship("ContactGroup", back_populates="owner")
    database_connections = relationship("DatabaseConnection", back_populates="owner")
    campaigns = relationship("Campaign", back_populates="owner")
    sms_logs = relationship("SMSLog", back_populates="owner")
    usage_logs = relationship("SMSUsageLog", back_populates="user")

class Device(Base):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    device_name = Column(String)
    phone_model = Column(String)
    android_version = Column(String)
    battery_level = Column(Integer, default=100)
    sim_count = Column(Integer, default=1)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    owner = relationship("User", back_populates="devices")
    sim_cards = relationship("SIMCard", back_populates="device")
    sms_logs = relationship("SMSLog", back_populates="device")

class SIMCard(Base):
    __tablename__ = "sim_cards"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"))
    sim_slot = Column(Integer)  # 0 or 1 for dual SIM
    carrier_name = Column(String)
    phone_number = Column(String)
    is_active = Column(Boolean, default=True)
    daily_limit = Column(Integer, default=200)  # Estimated Daily Usage
    sms_sent_today = Column(Integer, default=0)
    last_reset_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    device = relationship("Device", back_populates="sim_cards")

class SMSUsageLog(Base):
    __tablename__ = "sms_usage_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime(timezone=True), server_default=func.now())
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    carrier_failure_spikes = Column(Integer, default=0)
    
    user = relationship("User", back_populates="usage_logs")

class ContactGroup(Base):
    __tablename__ = "contact_groups"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(String)
    source_type = Column(String)  # 'MANUAL', 'CSV', 'DATABASE'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="contact_groups")
    contacts = relationship("Contact", back_populates="group", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="contact_group")

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("contact_groups.id"))
    full_name = Column(String)
    phone_number = Column(String, nullable=False)
    email = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("ContactGroup", back_populates="contacts")

class DatabaseConnection(Base):
    __tablename__ = "database_connections"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    db_type = Column(String)  # 'postgresql', 'mysql'
    host = Column(String)
    port = Column(Integer)
    database_name = Column(String)
    username = Column(String)
    encrypted_password = Column(String)
    table_name = Column(String)
    phone_column = Column(String)
    name_column = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="database_connections")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    contact_group_id = Column(Integer, ForeignKey("contact_groups.id"))
    name = Column(String, nullable=False)
    message_template = Column(Text, nullable=False)
    status = Column(String, default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED, PAUSED
    total_messages = Column(Integer, default=0)
    sent_messages = Column(Integer, default=0)
    failed_messages = Column(Integer, default=0)
    scheduled_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="campaigns")
    contact_group = relationship("ContactGroup", back_populates="campaigns")
    recipients = relationship("CampaignRecipient", back_populates="campaign", cascade="all, delete-orphan")

class CampaignRecipient(Base):
    __tablename__ = "campaign_recipients"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    phone_number = Column(String, nullable=False)
    full_name = Column(String)
    status = Column(String, default="PENDING")
    sent_at = Column(DateTime(timezone=True))
    error_message = Column(String)
    
    campaign = relationship("Campaign", back_populates="recipients")

class SMSLog(Base):
    __tablename__ = "sms_logs"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    device_id = Column(Integer, ForeignKey("devices.id"))
    sim_slot = Column(Integer, default=0)
    phone_number = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="PENDING")
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    device = relationship("Device", back_populates="sms_logs")
    owner = relationship("User", back_populates="sms_logs")
