from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query, Request, BackgroundTasks
from sqlalchemy.orm import Session
import models, schemas
from database import get_db, SessionLocal
from services import ai_service
from typing import List, Optional
import os
import shutil
import uuid
import datetime

router = APIRouter(prefix="/api/apps", tags=["Aplicaciones (Marketplace)"])

UPLOADS_IMG = "uploads/images"
UPLOADS_ZIP = "uploads/zips"
LIMITE_BASIC = 5  # Máximo apps plan BASICO (CU7)

# La lógica de IA ahora se maneja manualmente a través del router /ai/

# ─── CU8 – Explorar Marketplace (público) ────────────────────────────────────
@router.get("/", response_model=List[schemas.AplicacionResponse])
def explore_marketplace(
    categoria_id: Optional[int] = Query(None),
    q: Optional[str] = Query(None, description="Búsqueda por título"),
    db: Session = Depends(get_db)
):
    """CU8 – Explorar Marketplace. Filtra por categoría y/o texto."""
    query = db.query(models.Aplicacion).filter(
        models.Aplicacion.estado == models.EstadoApp.ACTIVA.value
    )
    if categoria_id:
        query = query.filter(models.Aplicacion.categoria_id == categoria_id)
    if q:
        query = query.filter(models.Aplicacion.titulo.ilike(f"%{q}%"))
    return query.order_by(models.Aplicacion.fecha_publicacion.desc()).all()

# ─── Listar categorías ────────────────────────────────────────────────────────
@router.get("/categorias", response_model=List[schemas.CategoriaResponse])
def get_categorias(db: Session = Depends(get_db)):
    """Retorna todas las categorías disponibles."""
    return db.query(models.Categoria).all()

# ─── CU7 – Portafolio del vendedor ───────────────────────────────────────────
@router.get("/portfolio/{seller_id}")
def get_portfolio(seller_id: int, db: Session = Depends(get_db)):
    """CU7 – Listar mis apps con conteo real de ventas por app."""
    apps = db.query(models.Aplicacion).filter(
        models.Aplicacion.vendedor_id == seller_id
    ).order_by(models.Aplicacion.fecha_publicacion.desc()).all()

    result = []
    for app in apps:
        ventas = db.query(models.Transaccion).filter(
            models.Transaccion.aplicacion_id == app.id,
            models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value
        ).count()
        ingresos = sum(
            t.monto_pagado for t in db.query(models.Transaccion).filter(
                models.Transaccion.aplicacion_id == app.id,
                models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value
            ).all()
        )
        result.append({
            "id": app.id,
            "titulo": app.titulo,
            "descripcion": app.descripcion,
            "tecnologia": app.tecnologia,
            "precio_venta": app.precio_venta,
            "precio_sugerido": app.precio_sugerido,
            "url_codigo": app.url_codigo,
            "url_manual": app.url_manual,
            "estado": app.estado,
            "visitas": app.visitas,
            "sello_calidad": app.sello_calidad,
            "manual_markdown": app.manual_markdown,
            "fecha_publicacion": app.fecha_publicacion,
            "vendedor_id": app.vendedor_id,
            "categoria_id": app.categoria_id,
            "ventas": ventas,
            "ingresos": ingresos,
        })
    return result

# ─── CU9 – Ver Detalle de Aplicación ─────────────────────────────────────────
@router.get("/{app_id}", response_model=schemas.AplicacionResponse)
def view_app_detail(app_id: int, request: Request, usuario_id: Optional[int] = None, db: Session = Depends(get_db)):
    """CU9 – Ver detalle e incrementar visitas únicas."""
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    
    # 1. Si es el vendedor de la app, NO sumamos visita
    if usuario_id and usuario_id == app.vendedor_id:
        return app
        
    # 2. Obtenemos IP o usamos usuario_id para registrar
    ip = request.client.host if request.client else "unknown"
    
    # 3. Verificamos si esta persona ya vio la app hoy
    query = db.query(models.VisitaApp).filter(models.VisitaApp.aplicacion_id == app_id)
    if usuario_id:
        query = query.filter(models.VisitaApp.usuario_id == usuario_id)
    else:
        query = query.filter(models.VisitaApp.ip_visitante == ip)
        
    ya_visito = query.first()
    
    # 4. Si no la ha visto, sumamos 1 y registramos
    if not ya_visito:
        app.visitas += 1
        nueva_visita = models.VisitaApp(
            aplicacion_id=app.id,
            ip_visitante=ip if not usuario_id else None,
            usuario_id=usuario_id
        )
        db.add(nueva_visita)
        db.commit()
        db.refresh(app)
        
    return app

# ─── CU6 – Subir Nueva Aplicación ────────────────────────────────────────────
@router.post("/", response_model=schemas.AplicacionResponse, status_code=201)
async def upload_new_app(
    background_tasks: BackgroundTasks,
    titulo: str = Form(...),
    descripcion: str = Form(...),
    tecnologia: str = Form(...),
    precio_venta: float = Form(...),
    categoria_id: int = Form(...),
    vendedor_id: int = Form(...),
    codigo_zip: UploadFile = File(...),
    imagenes: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db)
):
    """CU6 – Subir nueva app. Verifica límite BASIC (5 apps)."""
    os.makedirs(UPLOADS_ZIP, exist_ok=True)
    os.makedirs(UPLOADS_IMG, exist_ok=True)

    # Verificar límite plan BASIC (CU7)
    vendedor = db.query(models.Usuario).filter(models.Usuario.id == vendedor_id).first()
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor no encontrado")

    is_premium = (vendedor.plan_suscripcion == models.PlanSuscripcion.PREMIUM.value)

    if not is_premium:
        total_apps = db.query(models.Aplicacion).filter(
            models.Aplicacion.vendedor_id == vendedor_id
        ).count()
        if total_apps >= LIMITE_BASIC:
            raise HTTPException(
                status_code=403,
                detail=f"Plan BÁSICO permite máximo {LIMITE_BASIC} aplicaciones. Actualiza a PREMIUM para subir más."
            )

    # Validar límite de manuales generados
    limit_manuales = 10 if is_premium else 1
    hoy = datetime.datetime.utcnow().date()
    if vendedor.fecha_ultima_actividad:
        last_date = vendedor.fecha_ultima_actividad.date()
        if last_date.month != hoy.month or last_date.year != hoy.year:
            vendedor.manuales_generados_mes = 0
            
    if vendedor.manuales_generados_mes >= limit_manuales:
        raise HTTPException(
            status_code=403,
            detail=f"Has alcanzado el límite de {limit_manuales} manual(es) autogenerado(s) este mes."
        )
    vendedor.manuales_generados_mes += 1
    vendedor.fecha_ultima_actividad = datetime.datetime.utcnow()

    # Validar ZIP
    if not codigo_zip.filename.lower().endswith(('.zip', '.rar')):
        raise HTTPException(status_code=400, detail="El archivo de código debe ser .zip o .rar")

    # Guardar ZIP con nombre único
    zip_ext = codigo_zip.filename.rsplit('.', 1)[-1]
    zip_filename = f"{vendedor_id}_{uuid.uuid4().hex[:8]}.{zip_ext}"
    zip_path = f"{UPLOADS_ZIP}/{zip_filename}"
    with open(zip_path, "wb") as buf:
        shutil.copyfileobj(codigo_zip.file, buf)

    # Guardar hasta 5 imágenes — guardamos la primera como url_manual (thumbnail) y todas en imagenes_urls
    img_principal = None
    all_img_paths = []
    imagenes_validas = [img for img in imagenes if img.filename]
    for i, img in enumerate(imagenes_validas[:5]):
        img_ext = img.filename.rsplit('.', 1)[-1] if '.' in img.filename else 'jpg'
        img_filename = f"{vendedor_id}_{uuid.uuid4().hex[:8]}_{i}.{img_ext}"
        img_path_full = f"{UPLOADS_IMG}/{img_filename}"
        with open(img_path_full, "wb") as buf:
            shutil.copyfileobj(img.file, buf)
        
        web_path = f"/uploads/images/{img_filename}"
        all_img_paths.append(web_path)
        if i == 0:
            img_principal = web_path

    # Crear app con estado EN_REVISION
    new_app = models.Aplicacion(
        titulo=titulo,
        descripcion=descripcion,
        tecnologia=tecnologia,
        precio_sugerido=precio_venta,
        precio_venta=precio_venta,
        url_codigo=f"/uploads/zips/{zip_filename}",
        url_manual=img_principal,
        imagenes_urls=",".join(all_img_paths),
        vendedor_id=vendedor_id,
        categoria_id=categoria_id,
        estado=models.EstadoApp.EN_REVISION.value,
    )
    db.add(new_app)
    db.commit()
    db.commit()
    db.refresh(new_app)
    
    return new_app

# ─── CU7 – Editar App ────────────────────────────────────────────────────────
@router.put("/{app_id}", response_model=schemas.AplicacionResponse)
def update_app(
    app_id: int,
    app_update: schemas.AplicacionUpdate,
    seller_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """CU7 – Editar app (solo el dueño)."""
    db_app = db.query(models.Aplicacion).filter(
        models.Aplicacion.id == app_id,
        models.Aplicacion.vendedor_id == seller_id
    ).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="App no encontrada o sin permisos")

    if app_update.titulo is not None:
        db_app.titulo = app_update.titulo
    if app_update.descripcion is not None:
        db_app.descripcion = app_update.descripcion
    if app_update.precio_venta is not None:
        db_app.precio_venta = app_update.precio_venta
    if app_update.tecnologia is not None:
        db_app.tecnologia = app_update.tecnologia
    if app_update.estado is not None:
        db_app.estado = app_update.estado
    if app_update.manual_markdown is not None:
        db_app.manual_markdown = app_update.manual_markdown

    db.commit()
    db.refresh(db_app)
    return db_app

# ─── CU7 – Activar / Desactivar App ─────────────────────────────────────────
@router.patch("/{app_id}/toggle", response_model=schemas.AplicacionResponse)
def toggle_app_estado(app_id: int, seller_id: int = Query(...), db: Session = Depends(get_db)):
    """CU7 – Alternar ACTIVA ↔ INACTIVA."""
    db_app = db.query(models.Aplicacion).filter(
        models.Aplicacion.id == app_id,
        models.Aplicacion.vendedor_id == seller_id
    ).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="App no encontrada o sin permisos")

    if db_app.estado == models.EstadoApp.ACTIVA.value:
        db_app.estado = models.EstadoApp.INACTIVA.value
    else:
        db_app.estado = models.EstadoApp.ACTIVA.value

    db.commit()
    db.refresh(db_app)
    return db_app

# ─── CU7 – Eliminar App ───────────────────────────────────────────────────────
@router.delete("/{app_id}")
def delete_app(app_id: int, seller_id: int = Query(...), db: Session = Depends(get_db)):
    """CU7 – Eliminar app (solo si no tiene transacciones)."""
    db_app = db.query(models.Aplicacion).filter(
        models.Aplicacion.id == app_id,
        models.Aplicacion.vendedor_id == seller_id
    ).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="App no encontrada o sin permisos")

    tiene_ventas = db.query(models.Transaccion).filter(
        models.Transaccion.aplicacion_id == app_id
    ).count()
    if tiene_ventas > 0:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar una app que ya tiene ventas registradas."
        )

    # Eliminar archivos físicos
    if db_app.url_codigo:
        path = db_app.url_codigo.lstrip("/")
        if os.path.exists(path):
            os.remove(path)

    db.delete(db_app)
    db.commit()
    return {"message": "Aplicación eliminada correctamente"}

# ─── Seed de Categorías ───────────────────────────────────────────────────────
@router.post("/admin/seed-categorias")
def seed_categorias(db: Session = Depends(get_db)):
    """Crea categorías iniciales si no existen."""
    categorias_seed = [
        {"nombre": "Gestión Empresarial", "descripcion": "Sistemas ERP, CRM, contabilidad", "icono": "fa-briefcase"},
        {"nombre": "Inventario y Ventas",  "descripcion": "Control de stock y punto de venta", "icono": "fa-boxes"},
        {"nombre": "Salud y Farmacia",     "descripcion": "Clínicas, farmacias, médicos", "icono": "fa-heartbeat"},
        {"nombre": "Educación",            "descripcion": "Plataformas académicas y e-learning", "icono": "fa-graduation-cap"},
        {"nombre": "Recursos Humanos",     "descripcion": "Nómina, asistencia, RRHH", "icono": "fa-users"},
        {"nombre": "Restaurantes",         "descripcion": "Comandas, mesas, delivery", "icono": "fa-utensils"},
        {"nombre": "Logística",            "descripcion": "Transporte, rutas, entregas", "icono": "fa-truck"},
        {"nombre": "Otros",                "descripcion": "Otras categorías", "icono": "fa-cube"},
    ]
    creadas = 0
    for cat in categorias_seed:
        existe = db.query(models.Categoria).filter(models.Categoria.nombre == cat["nombre"]).first()
        if not existe:
            db.add(models.Categoria(**cat))
            creadas += 1
    db.commit()
    return {"message": f"{creadas} categorías creadas"}
