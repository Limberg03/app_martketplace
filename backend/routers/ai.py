from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from pydantic import BaseModel
import shutil
import os
from typing import List
from services import ai_service
from sqlalchemy.orm import Session
import datetime
import models
from database import get_db

router = APIRouter(prefix="/api/ai", tags=["Inteligencia Artificial"])

class SuggestPriceRequest(BaseModel):
    usuario_id: int
    titulo: str
    descripcion: str
    tecnologia: str

class ChatRequest(BaseModel):
    usuario_id: int
    pregunta: str

class SemanticSearchRequest(BaseModel):
    usuario_id: int
    query: str
    limit: int = 3

def check_and_update_limits(usuario: models.Usuario, action: str):
    hoy = datetime.datetime.utcnow().date()
    if usuario.fecha_ultima_actividad:
        last_date = usuario.fecha_ultima_actividad.date()
        if last_date < hoy:
            usuario.consultas_ia = 0
            usuario.sugerencias_precio_diarias = 0
        if last_date.month != hoy.month or last_date.year != hoy.year:
            usuario.manuales_generados_mes = 0
            
    usuario.fecha_ultima_actividad = datetime.datetime.utcnow()
    
    is_premium = (usuario.plan_suscripcion == models.PlanSuscripcion.PREMIUM.value)
    
    if action == 'search':
        limit = 20 if is_premium else 3
        if usuario.consultas_ia >= limit:
            raise HTTPException(status_code=403, detail=f"Límite diario de búsquedas alcanzado ({limit}).")
        usuario.consultas_ia += 1
        
    elif action == 'chat':
        limit = 99999 if is_premium else 5
        if usuario.consultas_ia >= limit:
            raise HTTPException(status_code=403, detail=f"Límite diario de chat alcanzado ({limit if not is_premium else 'ilimitado'}).")
        usuario.consultas_ia += 1
        
    elif action == 'suggest_price':
        limit = 10 if is_premium else 1
        if usuario.sugerencias_precio_diarias >= limit:
            raise HTTPException(status_code=403, detail=f"Límite diario de sugerencias alcanzado ({limit}).")
        usuario.sugerencias_precio_diarias += 1

@router.post("/suggest-price")
async def suggest_price(
    usuario_id: int = Form(...),
    titulo: str = Form(...),
    descripcion: str = Form(...),
    tecnologia: str = Form(...),
    codigo_zip: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """CU13: Sugiere un precio usando IA basado en el título, descripción y opcionalmente el código fuente."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    check_and_update_limits(usuario, 'suggest_price')
    
    temp_zip_path = None
    if codigo_zip and codigo_zip.filename:
        # Guardar archivo temporalmente
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        temp_zip_path = os.path.join(temp_dir, f"temp_{usuario_id}_{codigo_zip.filename}")
        with open(temp_zip_path, "wb") as buffer:
            shutil.copyfileobj(codigo_zip.file, buffer)
            
    sugerencia = ai_service.suggest_price(titulo, descripcion, tecnologia, temp_zip_path)
    
    # Limpiar archivo temporal
    if temp_zip_path and os.path.exists(temp_zip_path):
        try:
            os.remove(temp_zip_path)
        except Exception:
            pass
            
    db.commit()
    return {"sugerencia": sugerencia}

@router.post("/chat/{app_id}")
def chat_with_app(app_id: int, req: ChatRequest, db: Session = Depends(get_db)):
    """CU17: RAG Chat para preguntar sobre una aplicación específica."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
        
    check_and_update_limits(usuario, 'chat')
    
    # CU17+: Obtener el zip_path si existe para enviarlo a la IA
    zip_path = None
    if app.url_codigo:
        base_path = os.getcwd()
        zip_path = os.path.join(base_path, app.url_codigo.lstrip("/"))
        
    respuesta = ai_service.chat_rag_app(app_id, req.pregunta, zip_path)
    db.commit()
    return {"respuesta": respuesta}

@router.post("/search")
def semantic_search(req: SemanticSearchRequest, db: Session = Depends(get_db)):
    """CU12: Búsqueda Avanzada de Aplicaciones usando IA Híbrida."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    check_and_update_limits(usuario, 'search')
    
    # Obtener todas las aplicaciones activas para que la IA las evalúe
    active_apps = db.query(models.Aplicacion).filter(models.Aplicacion.estado == models.EstadoApp.ACTIVA.value).all()
    apps_data = [
        {"id": a.id, "titulo": a.titulo, "descripcion": a.descripcion, "tecnologia": a.tecnologia}
        for a in active_apps
    ]
    
    ai_results = ai_service.advanced_ai_search(req.query, apps_data, req.limit)
    
    if not ai_results:
        return []
        
    # ai_results es un array de dicts: [{"id": 1, "razon": "..."}]
    results_map = {r["id"]: r.get("razon", "") for r in ai_results if "id" in r}
    
    if not results_map:
        return []
        
    # Recuperar las apps completas de la base de datos
    apps = db.query(models.Aplicacion).filter(models.Aplicacion.id.in_(list(results_map.keys()))).all()
    
    # Retornar los campos básicos + razon_ia
    response = []
    for a in apps:
        response.append({
            "id": a.id,
            "titulo": a.titulo,
            "descripcion": a.descripcion,
            "precio_venta": a.precio_venta,
            "sello_calidad": a.sello_calidad,
            "imagenes_urls": a.imagenes_urls,
            "tecnologia": a.tecnologia,
            "url_manual": a.url_manual,
            "razon_ia": results_map.get(a.id, "")
        })
    
    # Ordenar según el orden de ai_results (para que el top de IA salga primero)
    id_to_order = {r["id"]: i for i, r in enumerate(ai_results) if "id" in r}
    response.sort(key=lambda x: id_to_order.get(x["id"], 999))
    
    return response

class AIActionRequest(BaseModel):
    usuario_id: int

@router.post("/analyze-quality/{app_id}")
def analyze_quality(app_id: int, req: AIActionRequest, db: Session = Depends(get_db)):
    """CU15: Evalúa el código y asigna el Sello Grado A si corresponde."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app: raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    if app.vendedor_id != usuario.id: raise HTTPException(status_code=403, detail="No tienes permisos sobre esta app")
    if not app.url_codigo: raise HTTPException(status_code=400, detail="La aplicación no tiene código fuente (ZIP)")
        
    base_path = os.getcwd()
    zip_path = os.path.join(base_path, app.url_codigo.lstrip("/"))
    
    is_grade_a = ai_service.analyze_code_for_quality(zip_path, app.titulo)
    app.sello_calidad = is_grade_a
    db.commit()
    return {"sello_calidad": is_grade_a}

@router.post("/generate-manual/{app_id}")
def generate_manual(app_id: int, req: AIActionRequest, db: Session = Depends(get_db)):
    """CU14: Genera la documentación técnica de la app usando IA."""
    usuario = db.query(models.Usuario).filter(models.Usuario.id == req.usuario_id).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app: raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    if app.vendedor_id != usuario.id: raise HTTPException(status_code=403, detail="No tienes permisos sobre esta app")
    if not app.url_codigo: raise HTTPException(status_code=400, detail="La aplicación no tiene código fuente (ZIP)")
        
    # Limites (reusando logica de manuales_generados_mes)
    is_premium = (usuario.plan_suscripcion == models.PlanSuscripcion.PREMIUM.value)
    limit_manuales = 10 if is_premium else 1
    hoy = datetime.datetime.utcnow().date()
    if usuario.fecha_ultima_actividad:
        last_date = usuario.fecha_ultima_actividad.date()
        if last_date.month != hoy.month or last_date.year != hoy.year:
            usuario.manuales_generados_mes = 0
            
    if usuario.manuales_generados_mes >= limit_manuales:
        raise HTTPException(status_code=403, detail=f"Límite mensual de manuales alcanzado ({limit_manuales}).")
        
    usuario.manuales_generados_mes += 1
    usuario.fecha_ultima_actividad = datetime.datetime.utcnow()
    
    base_path = os.getcwd()
    zip_path = os.path.join(base_path, app.url_codigo.lstrip("/"))
    
    manual = ai_service.generate_documentation(zip_path, app.titulo)
    app.manual_markdown = manual
    
    # También indexar en Chroma para el RAG
    ai_service.index_app_for_search(app.id, app.titulo, app.descripcion, app.tecnologia, manual)
    
    db.commit()
    return {"manual_markdown": manual}

# ────────────────────────────────────────────────────────
# CU16: Seguimiento de Interacciones y Recomendaciones IA
# ────────────────────────────────────────────────────────

class TrackRequest(BaseModel):
    usuario_id: int
    app_id: int
    tipo_accion: str  # 'visita' | 'ver_doc' | 'busqueda_ia'

@router.post("/track")
def track_interaction(req: TrackRequest, db: Session = Depends(get_db)):
    """CU16: Registra una interacción del usuario (visita, ver documentación)."""
    peso = models.PESOS_INTERACCION.get(req.tipo_accion, 1)
    
    # Evitar duplicados recientes: no registrar si fue en los últimos 10 minutos
    hace_diez_min = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    reciente = db.query(models.HistorialInteraccion).filter(
        models.HistorialInteraccion.usuario_id == req.usuario_id,
        models.HistorialInteraccion.aplicacion_id == req.app_id,
        models.HistorialInteraccion.tipo_accion == req.tipo_accion,
        models.HistorialInteraccion.fecha >= hace_diez_min
    ).first()
    
    if not reciente:
        interaccion = models.HistorialInteraccion(
            usuario_id=req.usuario_id,
            aplicacion_id=req.app_id,
            tipo_accion=req.tipo_accion,
            peso=peso
        )
        db.add(interaccion)
        db.commit()
    
    return {"ok": True}

@router.get("/recommendations/{usuario_id}")
def get_recommendations(usuario_id: int, db: Session = Depends(get_db)):
    """CU16: Genera 4 recomendaciones personalizadas usando IA basadas en el historial del usuario."""
    # 1. Obtener el historial del usuario (last 60 interacciones)
    historial = db.query(models.HistorialInteraccion).filter(
        models.HistorialInteraccion.usuario_id == usuario_id
    ).order_by(models.HistorialInteraccion.fecha.desc()).limit(60).all()
    
    if not historial:
        return []
    
    # 2. Construir perfil de intereses: {titulo_app: puntos_totales}
    app_ids_vistos = list({h.aplicacion_id for h in historial})
    apps_vistas = db.query(models.Aplicacion).filter(models.Aplicacion.id.in_(app_ids_vistos)).all()
    titulo_por_id = {a.id: a.titulo for a in apps_vistas}
    
    perfil: dict = {}
    for h in historial:
        titulo = titulo_por_id.get(h.aplicacion_id, f"App #{h.aplicacion_id}")
        perfil[titulo] = perfil.get(titulo, 0) + h.peso
    
    # 3. Obtener apps activas que el usuario NO ha visto todavía
    todas_activas = db.query(models.Aplicacion).filter(
        models.Aplicacion.estado == models.EstadoApp.ACTIVA.value
    ).all()
    apps_data = [
        {"id": a.id, "titulo": a.titulo, "descripcion": a.descripcion, "tecnologia": a.tecnologia,
         "precio_venta": a.precio_venta, "sello_calidad": a.sello_calidad, "imagenes_urls": a.imagenes_urls}
        for a in todas_activas
    ]
    
    # 4. Pedir recomendaciones a la IA
    ai_results = ai_service.generate_recommendations(perfil, apps_data, excluir_ids=app_ids_vistos)
    
    if not ai_results:
        return []
    
    # 5. Enriquecer con datos completos de BD
    ids_recomendados = [r["id"] for r in ai_results if "id" in r]
    razon_map = {r["id"]: r.get("razon", "") for r in ai_results if "id" in r}
    
    apps_db = db.query(models.Aplicacion).filter(models.Aplicacion.id.in_(ids_recomendados)).all()
    
    response = []
    for a in apps_db:
        response.append({
            "id": a.id,
            "titulo": a.titulo,
            "descripcion": a.descripcion,
            "precio_venta": a.precio_venta,
            "tecnologia": a.tecnologia,
            "sello_calidad": a.sello_calidad,
            "imagenes_urls": a.imagenes_urls,
            "razon_ia": razon_map.get(a.id, "Recomendado para ti")
        })
    
    id_to_order = {r["id"]: i for i, r in enumerate(ai_results) if "id" in r}
    response.sort(key=lambda x: id_to_order.get(x["id"], 999))
    return response
