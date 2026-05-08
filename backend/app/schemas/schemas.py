from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Device Schemas
class DeviceBase(BaseModel):
    device_id: str
    model: Optional[str] = None
    android_version: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    is_online: bool
    last_seen: Optional[datetime]
    class Config:
        from_attributes = True

# SMS Schemas
class SMSCreate(BaseModel):
    phone_number: str
    message: str
    device_id: str

class SMSLog(BaseModel):
    id: int
    phone_number: str
    message: str
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
