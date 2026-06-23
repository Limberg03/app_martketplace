from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
import models
import schemas
import json
import os
from pywebpush import webpush, WebPushException

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])

# Dictionary to store active websocket connections
# En AWS usaríamos Redis o pub/sub real, pero en local usaremos la memoria
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    CU20: WebSockets. Endpoint para recibir notificaciones en tiempo real en la campana.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Mantener la conexión viva
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id)


# --- API VAPID para Push Notifications ---

@router.get("/vapid-public-key")
def get_vapid_public_key():
    """Retorna la llave pública para que el ServiceWorker se suscriba."""
    return {"public_key": os.getenv("VAPID_PUBLIC_KEY")}

@router.post("/subscribe")
def subscribe_push(sub_data: dict, db: Session = Depends(get_db)):
    """
    CU21: Guarda la suscripción Push del navegador del usuario.
    """
    endpoint = sub_data.get("endpoint")
    keys = sub_data.get("keys", {})
    p256dh = keys.get("p256dh")
    auth = keys.get("auth")

    if not endpoint or not p256dh or not auth:
        raise HTTPException(status_code=400, detail="Datos de suscripción incompletos")
        
    usuario_id = sub_data.get("usuario_id")
    if not usuario_id:
        raise HTTPException(status_code=400, detail="usuario_id es requerido")

    # Check if subscription already exists
    existing = db.query(models.SuscripcionPush).filter(models.SuscripcionPush.endpoint == endpoint).first()
    if existing:
        # Update just in case user changed
        existing.usuario_id = usuario_id
        db.commit()
        return {"status": "ok", "message": "Suscripción actualizada"}

    new_sub = models.SuscripcionPush(
        usuario_id=usuario_id,
        endpoint=endpoint,
        p256dh=p256dh,
        auth=auth
    )
    db.add(new_sub)
    db.commit()
    return {"status": "ok", "message": "Suscripción guardada"}

# --- Helper para Enviar Notificaciones ---
async def enviar_notificacion(db: Session, usuario_id: int, titulo: str, mensaje: str):
    """Guarda en BD, envía por WebSocket y dispara Web Push Notification"""
    
    # 1. Guardar en BD
    notif = models.Notificacion(usuario_id=usuario_id, titulo=titulo, mensaje=mensaje)
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # 2. WebSocket (In-App)
    await manager.send_personal_message(json.dumps({
        "type": "NEW_NOTIFICATION",
        "id": notif.id,
        "titulo": titulo,
        "mensaje": mensaje,
        "fecha": notif.fecha_creacion.isoformat()
    }), usuario_id)

    # 3. Web Push Notification
    subs = db.query(models.SuscripcionPush).filter(models.SuscripcionPush.usuario_id == usuario_id).all()
    if subs:
        vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
        vapid_claims = {"sub": os.getenv("VAPID_CLAIMS_EMAIL", "mailto:admin@uagrm.edu.bo")}
        import re
        mensaje_push = re.sub(r'\*\*(.*?)\*\*', r'\1', mensaje)
        
        payload = json.dumps({
            "title": titulo,
            "body": mensaje_push,
            "url": "http://localhost:5173/dashboard" # o mis-compras
        })

        for sub in subs:
            try:
                subscription_info = {
                    "endpoint": sub.endpoint,
                    "keys": {
                        "p256dh": sub.p256dh,
                        "auth": sub.auth
                    }
                }
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=vapid_private_key,
                    vapid_claims=vapid_claims
                )
            except WebPushException as ex:
                # If subscription is dead/unsubscribed, we could delete it
                if ex.response and ex.response.status_code in [404, 410]:
                    db.delete(sub)
                    db.commit()
                print("Push Error:", ex)

# --- Endpoints REST para historial de notificaciones ---

@router.get("/{usuario_id}")
def get_notificaciones(usuario_id: int, db: Session = Depends(get_db)):
    """Obtiene las últimas notificaciones del usuario."""
    notifs = db.query(models.Notificacion).filter(models.Notificacion.usuario_id == usuario_id).order_by(models.Notificacion.fecha_creacion.desc()).limit(50).all()
    
    # We will just return dicts manually to avoid creating extensive schemas right now
    return [{
        "id": n.id,
        "titulo": n.titulo,
        "mensaje": n.mensaje,
        "leido": n.leido,
        "fecha": n.fecha_creacion
    } for n in notifs]

@router.post("/{notif_id}/leer")
def marcar_como_leida(notif_id: int, usuario_id: int, db: Session = Depends(get_db)):
    notif = db.query(models.Notificacion).filter(models.Notificacion.id == notif_id, models.Notificacion.usuario_id == usuario_id).first()
    if notif:
        notif.leido = True
        db.commit()
    return {"status": "ok"}
