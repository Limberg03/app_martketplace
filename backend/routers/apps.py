from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from typing import List, Optional
import os
import shutil

router = APIRouter(prefix="/api/apps", tags=["Aplicaciones (Marketplace)"])

@router.get("/", response_model=List[schemas.AplicacionResponse])
def explore_marketplace(db: Session = Depends(get_db)):
    """Explorar Marketplace (público) - Ver todas las apps"""
    apps = db.query(models.Aplicacion).filter(models.Aplicacion.estado == models.EstadoApp.ACTIVA.value).all()
    return apps

@router.get("/{app_id}", response_model=schemas.AplicacionResponse)
def view_app_detail(app_id: int, db: Session = Depends(get_db)):
    """Ver Detalle de Aplicación"""
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada")
    
    # Incrementar visitas (simple)
    app.visitas += 1
    db.commit()
    db.refresh(app)
    return app

@router.post("/", response_model=schemas.AplicacionResponse)
async def upload_new_app(
    titulo: str = Form(...),
    descripcion: str = Form(...),
    tecnologia: str = Form(...),
    precio_venta: float = Form(...),
    vendedor_id: int = Form(...),
    codigo_zip: UploadFile = File(...),
    imagenes: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Subir Nueva Aplicación con archivos"""
    
    # Crear carpetas si no existen
    os.makedirs("uploads/zips", exist_ok=True)
    os.makedirs("uploads/images", exist_ok=True)

    # Guardar ZIP
    zip_path = f"uploads/zips/{vendedor_id}_{codigo_zip.filename}"
    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(codigo_zip.file, buffer)

    # Guardar primera imagen como url_manual (ejemplo simple para Sprint 1)
    img_path = None
    if imagenes and len(imagenes) > 0:
        img_path = f"uploads/images/{vendedor_id}_{imagenes[0].filename}"
        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(imagenes[0].file, buffer)

    # Crear categoria por defecto si no mandamos
    default_cat = db.query(models.Categoria).first()
    cat_id = default_cat.id if default_cat else 1

    new_app = models.Aplicacion(
        titulo=titulo,
        descripcion=descripcion,
        tecnologia=tecnologia,
        precio_sugerido=precio_venta, # Usamos el mismo para simplificar
        precio_venta=precio_venta,
        url_codigo=zip_path,
        url_manual=img_path,
        vendedor_id=vendedor_id,
        categoria_id=cat_id,
        estado=models.EstadoApp.ACTIVA.value # Aprobado automáticamente para este Sprint
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.put("/{app_id}", response_model=schemas.AplicacionResponse)
def update_app(app_id: int, app_update: schemas.AplicacionUpdate, seller_id: int, db: Session = Depends(get_db)):
    """Gestionar Portafolio (CRUD) - Editar App"""
    db_app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id, models.Aplicacion.vendedor_id == seller_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Aplicación no encontrada o sin permisos")
    
    if app_update.titulo:
        db_app.titulo = app_update.titulo
    if app_update.descripcion:
        db_app.descripcion = app_update.descripcion
    if app_update.precio_venta is not None:
        db_app.precio_venta = app_update.precio_venta
    if app_update.estado:
        db_app.estado = app_update.estado
        
    db.commit()
    db.refresh(db_app)
    return db_app

@router.get("/portfolio/{seller_id}", response_model=List[schemas.AplicacionResponse])
def get_portfolio(seller_id: int, db: Session = Depends(get_db)):
    """Gestionar Portafolio (CRUD) - Listar mis apps"""
    apps = db.query(models.Aplicacion).filter(models.Aplicacion.vendedor_id == seller_id).all()
    return apps
