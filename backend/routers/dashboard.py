from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard (Compras y Ventas)"])

@router.get("/compras/{comprador_id}")
def ver_mis_compras(comprador_id: int, db: Session = Depends(get_db)):
    """Ver Mis Compras (Comprador) - Historial básico"""
    # Excluyendo Pydantic para respuesta rápida, en prod usar schemas correspondientes
    transacciones = db.query(models.Transaccion).filter(models.Transaccion.comprador_id == comprador_id).all()
    compras = []
    for t in transacciones:
        compras.append({
            "id_transaccion": t.id,
            "monto": t.monto_pagado,
            "fecha": t.fecha,
            "estado": t.estado_pago,
            "aplicacion": {
                "id": t.aplicacion.id,
                "titulo": t.aplicacion.titulo,
                "url_codigo": t.aplicacion.url_codigo,
                "url_manual": t.aplicacion.url_manual
            }
        })
    return compras

@router.get("/ventas/{vendedor_id}")
def ver_mis_ventas(vendedor_id: int, db: Session = Depends(get_db)):
    """Ver Ventas (Vendedor) - Dashboard básico de ventas"""
    aplicaciones = db.query(models.Aplicacion).filter(models.Aplicacion.vendedor_id == vendedor_id).all()
    
    ventas_totales = 0.0
    historial = []
    
    for app in aplicaciones:
        transacciones = db.query(models.Transaccion).filter(
            models.Transaccion.aplicacion_id == app.id,
            models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value
        ).all()
        
        for t in transacciones:
            ventas_totales += t.monto_pagado
            historial.append({
                "id_venta": t.id,
                "fecha": t.fecha,
                "monto": t.monto_pagado,
                "app_titulo": app.titulo,
                "comprador": t.comprador.nombre
            })
            
    return {
        "ventas_totales": ventas_totales,
        "cantidad_ventas": len(historial),
        "historial": sorted(historial, key=lambda x: x["fecha"], reverse=True)
    }
