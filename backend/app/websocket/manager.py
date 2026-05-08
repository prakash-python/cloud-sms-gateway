from fastapi import WebSocket
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Active connections: {device_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_id] = websocket
        logger.info(f"Device {device_id} connected. Total active: {len(self.active_connections)}")

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]
            logger.info(f"Device {device_id} disconnected. Total active: {len(self.active_connections)}")

    async def send_sms_request(self, device_id: str, phone_number: str, message: str, log_id: int):
        if device_id in self.active_connections:
            websocket = self.active_connections[device_id]
            payload = {
                "type": "SEND_SMS",
                "data": {
                    "log_id": log_id,
                    "phone": phone_number,
                    "message": message
                }
            }
            try:
                await websocket.send_text(json.dumps(payload))
                return True
            except Exception as e:
                logger.error(f"Error sending SMS request to {device_id}: {e}")
                return False
        return False

    async def get_online_devices(self) -> List[str]:
        return list(self.active_connections.keys())

manager = ConnectionManager()
