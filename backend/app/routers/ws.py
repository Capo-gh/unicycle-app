from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.message import Conversation
from ..utils.auth import verify_token

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections keyed by user_id."""

    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        conns = self.active_connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.active_connections.pop(user_id, None)

    async def send_to_user(self, user_id: int, data: dict):
        """Push a JSON payload to all active connections for a user."""
        dead = []
        for ws in list(self.active_connections.get(user_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, user_id)


# Singleton imported by messages.py to push new messages
manager = ConnectionManager()


@router.websocket("/ws/conversations/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    # Authenticate via query param (browsers can't set headers for WebSocket)
    email = verify_token(token)
    if not email:
        await websocket.close(code=4001)
        return

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_verified or user.is_suspended:
        await websocket.close(code=4001)
        return

    # Verify the user is a participant in the conversation
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation or (
        conversation.buyer_id != user.id and conversation.seller_id != user.id
    ):
        await websocket.close(code=4003)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            # Keep alive; receive_text raises WebSocketDisconnect on client close
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
