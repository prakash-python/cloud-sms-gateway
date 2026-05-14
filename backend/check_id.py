import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Device
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

device = db.query(Device).first()
if device:
    print(f"Device ID: {device.device_id!r}")
    print(f"Length: {len(device.device_id)}")
else:
    print("No device found")

db.close()
