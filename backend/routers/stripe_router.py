import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
import models
from database import get_db

router = APIRouter(prefix="/api/stripe", tags=["Pagos con Stripe"])

# Configurar Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_placeholder")

# En frontend debes tener estas URLs (por ahora hardcodeadas para local)
FRONTEND_URL = "http://localhost:5173"

@router.post("/create-checkout-session")
def create_checkout_session(app_id: int, comprador_id: int, db: Session = Depends(get_db)):
    """Crea una sesión de pago en Stripe para comprar una App."""
    aplicacion = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not aplicacion:
        raise HTTPException(status_code=404, detail="App no encontrada")
        
    comprador = db.query(models.Usuario).filter(models.Usuario.id == comprador_id).first()
    if not comprador:
        raise HTTPException(status_code=404, detail="Comprador no encontrado")
        
    try:
        # 1. Crear la transacción como PENDIENTE
        nueva_tx = models.Transaccion(
            monto_pagado=aplicacion.precio_venta,
            estado_pago=models.EstadoPago.PENDIENTE.value,
            aplicacion_id=aplicacion.id,
            comprador_id=comprador.id
        )
        db.add(nueva_tx)
        db.commit()
        db.refresh(nueva_tx)
        
        # 2. Crear sesión en Stripe
        # Stripe espera montos en centavos (ej. 280 Bs -> 28000 si fuera USD, ajusta según moneda)
        # Aquí asumiremos BOB o USD. Stripe maneja BOB en centavos también.
        precio_centavos = int(aplicacion.precio_venta * 100)
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'bob',  # o 'usd'
                    'product_data': {
                        'name': aplicacion.titulo,
                        'description': f"Compra de aplicación: {aplicacion.titulo}",
                    },
                    'unit_amount': precio_centavos,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{FRONTEND_URL}/compras?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/app/{aplicacion.id}?canceled=true",
            client_reference_id=str(nueva_tx.id)  # Pasamos el ID de la transacción para el webhook
        )
        
        # 3. Guardar el session_id en la BD
        nueva_tx.stripe_session_id = session.id
        db.commit()
        
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-subscription-session")
def create_subscription_session(usuario_id: int, db: Session = Depends(get_db)):
    """Crea una sesión de Stripe para suscribirse al plan PREMIUM."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Plan Premium',
                        'description': 'Suscripción Premium para subir apps ilimitadas',
                    },
                    'unit_amount': 1000, # 10 USD
                    'recurring': {
                        'interval': 'month'
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f"{FRONTEND_URL}/perfil?premium=true",
            cancel_url=f"{FRONTEND_URL}/perfil?canceled=true",
            client_reference_id=f"SUB_{usuario.id}"
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate-upgrade/{usuario_id}")
def simulate_upgrade(usuario_id: int, db: Session = Depends(get_db)):
    """Simula el webhook de Stripe para actualizar a PREMIUM en localhost."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    usuario.plan_suscripcion = models.PlanSuscripcion.PREMIUM.value
    db.commit()
    return {"status": "success", "message": "Usuario actualizado a PREMIUM exitosamente."}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Recibe eventos de Stripe para confirmar el pago."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # En producción deberías verificar la firma del webhook con endpoint_secret
    # endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Event.construct_from(
            import_json=True,
            **await request.json() # simplificado para prueba, lo ideal es stripe.Webhook.construct_event
        )
    except Exception as e:
        event = await request.json()
        
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        tx_id_str = session.get('client_reference_id')
        if tx_id_str:
            if tx_id_str.startswith('SUB_'):
                usuario_id = int(tx_id_str.replace('SUB_', ''))
                usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
                if usuario:
                    usuario.plan_suscripcion = models.PlanSuscripcion.PREMIUM.value
                    db.commit()
            else:
                tx = db.query(models.Transaccion).filter(models.Transaccion.id == int(tx_id_str)).first()
                if tx and tx.estado_pago == models.EstadoPago.PENDIENTE.value:
                    tx.estado_pago = models.EstadoPago.COMPLETADO.value
                    db.commit()
                # Aquí se podría crear una Notificación (CU21)
                
    return {"status": "success"}
