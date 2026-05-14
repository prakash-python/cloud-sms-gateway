import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Device, SIMCard, User
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
db = Session()

print("--- Devices ---")
devices = db.query(Device).all()
for d in devices:
    print(f"ID: {d.id}, DeviceID: {d.device_id}, OwnerID: {d.owner_id}, Name: {d.device_name}")

print("\n--- SIM Cards ---")
sims = db.query(SIMCard).all()
for s in sims:
    print(f"ID: {s.id}, DeviceID: {s.device_id}, Slot: {s.sim_slot}, Number: {s.phone_number}")

print("\n--- Users ---")
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id}, Username: {u.username}")

db.close()
