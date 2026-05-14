from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
from datetime import datetime
import re

# Role Schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# SIM Schemas
class SIMCardBase(BaseModel):
    sim_slot: int
    carrier_name: Optional[str] = None
    phone_number: Optional[str] = None
    daily_limit: int = 200

class SIMCardCreate(SIMCardBase):
    device_id: int

class SIMCard(SIMCardBase):
    id: int
    device_id: int
    is_active: bool
    sms_sent_today: int
    last_reset_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    full_name: Optional[str] = None
    phone_number: str
    email: Optional[EmailStr] = None

class ContactCreate(ContactBase):
    group_id: int

class ContactUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None

class Contact(ContactBase):
    id: int
    group_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Group Schemas
class ContactGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    source_type: str = "MANUAL"

class ContactGroupCreate(ContactGroupBase):
    pass

class ContactGroup(ContactGroupBase):
    id: int
    owner_id: int
    contact_count: int = 0
    created_at: datetime
    class Config:
        from_attributes = True

class ContactGroupWithContacts(ContactGroup):
    contacts: List[Contact] = []

# Campaign Schemas
class CampaignBase(BaseModel):
    name: str
    message_template: str
    contact_group_id: int
    scheduled_at: Optional[datetime] = None

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    message_template: Optional[str] = None
    contact_group_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None

class Campaign(CampaignBase):
    id: int
    owner_id: int
    status: str
    total_messages: int
    sent_messages: int
    failed_messages: int
    source_type: str = "MANUAL"
    created_at: datetime
    class Config:
        from_attributes = True

class CampaignRecipient(BaseModel):
    id: int
    campaign_id: int
    phone_number: str
    full_name: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

# DB Connection Schemas
class DBConnectionBase(BaseModel):
    db_type: Optional[str] = "postgresql"
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    connection_url: Optional[str] = None
    table_name: str
    phone_column: str
    first_name_column: Optional[str] = None
    last_name_column: Optional[str] = None

class DBConnectionCreate(DBConnectionBase):
    password: str

class DBConnection(DBConnectionBase):
    id: int
    owner_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=4)
    first_name: str = Field(..., min_length=2)
    last_name: str = Field(..., min_length=1)
    phone_number: str = Field(..., min_length=5, max_length=20)
    country: str
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    role: Optional[Role] = None
    class Config:
        from_attributes = True

# Device Schemas
class DeviceBase(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    phone_model: Optional[str] = None
    android_version: Optional[str] = None
    battery_level: Optional[int] = 100
    sim_count: Optional[int] = 1

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    is_online: bool
    owner_id: Optional[int] = None
    last_seen: Optional[datetime] = None
    class Config:
        from_attributes = True

# SMS Schemas
class SMSCreate(BaseModel):
    phone_number: str
    message: str
    device_id: str
    sim_slot: int = 0
    full_name: Optional[str] = None
    source: Optional[str] = "individual"

class SMSLog(BaseModel):
    id: int
    phone_number: str
    full_name: Optional[str] = None
    message: str
    status: str
    source: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    device_id: Optional[int] = None
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class SMSHistoryResponse(BaseModel):
    total: int
    logs: List[SMSLog]

    class Config:
        from_attributes = True
