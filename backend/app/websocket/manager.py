from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConnectionManager, cls).__new__(cls)
            cls._instance.active_connections = {}
            logger.info(f"PERMANENT_SINGLETON_CREATED: {id(cls._instance)}")
        return cls._instance

    def __init__(self):
        # active_connections is initialized in __new__ to prevent clearing it on every import
        pass

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_id] = websocket
        logger.info(f"MANAGER_ID[{id(self)}] Device {device_id} CONNECTED. Total: {len(self.active_connections)}")
        logger.info(f"ACTIVE_DEVICES: {list(self.active_connections.keys())}")

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]
            logger.info(f"Device {device_id} DISCONNECTED from manager {id(self)}. Total active: {len(self.active_connections)}")

    async def send_sms_request(self, device_id: str, phone_number: str, message: str, log_id: int, sim_slot: int = 0):
        if device_id in self.active_connections:
            websocket = self.active_connections[device_id]
            payload = {
                "type": "SEND_SMS",
                "data": {
                    "log_id": log_id,
                    "phone": phone_number,
                    "message": message,
                    "sim_slot": sim_slot
                }
            }
            try:
                await websocket.send_text(json.dumps(payload))
                return True
            except Exception as e:
                logger.error(f"Error sending SMS request to {device_id}: {e}")
                return False
        return False

    async def send_personal_message(self, message: str, device_id: str):
        if device_id in self.active_connections:
            websocket = self.active_connections[device_id]
            try:
                await websocket.send_text(message)
                return True
            except Exception as e:
                logger.error(f"Error sending message to {device_id}: {e}")
                return False
        return False

    async def get_online_devices(self) -> List[str]:
        return list(self.active_connections.keys())

manager = ConnectionManager()
logger.info(f"ConnectionManager INITIALIZED: {id(manager)}")
