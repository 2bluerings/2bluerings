import logging
from typing import Dict, List
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[UUID, List[WebSocket]]] = {}

    def connect(self, namespace: str, project_id: UUID, websocket: WebSocket):
        self.active_connections.setdefault(
            namespace, {}
        ).setdefault(
            project_id, []
        ).append(websocket)

    def disconnect(self, namespace: str, project_id: UUID, websocket: WebSocket):
        try:
            self.active_connections[namespace][project_id].remove(websocket)
            if not self.active_connections[namespace][project_id]:
                del self.active_connections[namespace][project_id]
            if not self.active_connections[namespace]:
                del self.active_connections[namespace]
        except (KeyError, ValueError):
            logger.warning(
                "Tried to disconnect unknown socket for namespace=%s project_id=%s",
                namespace, project_id
            )

    async def send_to_project(self, namespace: str, project_id: UUID, message: dict):
        project_connections = self.active_connections.get(
            namespace, {}
        ).get(
            project_id, []
        )
        disconnected = []

        for websocket in project_connections:
            try:
                await websocket.send_json(message)
            except (RuntimeError, WebSocketDisconnect) as e:
                logger.warning(
                    "WebSocket disconnected for namespace=%s project_id=%s: %s",
                    namespace,
                    project_id,
                    e
                )
                disconnected.append(websocket)

        for ws in disconnected:
            self.disconnect(namespace, project_id, ws)

connection_manager = ConnectionManager()
