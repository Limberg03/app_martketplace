from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db
from typing import List
from sqlalchemy import func
import calendar

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

@router.get("/metricas/{vendedor_id}")
def metricas_avanzadas(vendedor_id: int, db: Session = Depends(get_db)):
    """CU23: Métricas avanzadas para gráficos (ventas por mes, etc)."""
    aplicaciones = db.query(models.Aplicacion).filter(models.Aplicacion.vendedor_id == vendedor_id).all()
    app_ids = [app.id for app in aplicaciones]
    
    if not app_ids:
        return {"ventas_mensuales": [], "top_apps": [], "ventas_por_categoria": []}
        
    # Ventas por mes
    ventas = db.query(models.Transaccion).filter(
        models.Transaccion.aplicacion_id.in_(app_ids),
        models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value
    ).all()
    
    # Agrupar por mes (0-11)
    mensuales_dict = {i: 0 for i in range(1, 13)}
    for v in ventas:
        mensuales_dict[v.fecha.month] += v.monto_pagado
        
    ventas_mensuales = [
        {"name": calendar.month_abbr[month], "Ventas": amount}
        for month, amount in mensuales_dict.items()
    ]
    
    # Top Apps
    top_apps_dict = {}
    for v in ventas:
        if v.aplicacion.titulo not in top_apps_dict:
            top_apps_dict[v.aplicacion.titulo] = 0
        top_apps_dict[v.aplicacion.titulo] += v.monto_pagado
        
    top_apps = [
        {"name": app, "Ingresos": amount}
        for app, amount in sorted(top_apps_dict.items(), key=lambda x: x[1], reverse=True)[:3]
    ]
    # Ventas por Categoría
    cat_dict = {}
    for v in ventas:
        cat_nombre = v.aplicacion.categoria.nombre if v.aplicacion.categoria else "Sin categoría"
        if cat_nombre not in cat_dict:
            cat_dict[cat_nombre] = 0
        cat_dict[cat_nombre] += v.monto_pagado
        
    ventas_por_categoria = [
        {"name": cat, "value": amount}
        for cat, amount in cat_dict.items()
    ]
    
    return {
        "ventas_mensuales": ventas_mensuales,
        "top_apps": top_apps,
        "ventas_por_categoria": ventas_por_categoria
    }

