from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["Administración"])

def verify_admin(admin_id: int, db: Session):
    admin = db.query(models.Usuario).filter(models.Usuario.id == admin_id).first()
    if not admin or admin.rol != models.RolUsuario.ADMIN.value:
        raise HTTPException(status_code=403, detail="Acceso denegado. Se requiere rol de Administrador.")
    return admin

@router.get("/stats")
def get_dashboard_stats(admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    
    total_usuarios = db.query(models.Usuario).count()
    total_vendedores = db.query(models.Usuario).filter(models.Usuario.rol == models.RolUsuario.VENDEDOR.value).count()
    total_compradores = db.query(models.Usuario).filter(models.Usuario.rol == models.RolUsuario.COMPRADOR.value).count()
    
    total_apps = db.query(models.Aplicacion).count()
    apps_activas = db.query(models.Aplicacion).filter(models.Aplicacion.estado == models.EstadoApp.ACTIVA.value).count()
    apps_revision = db.query(models.Aplicacion).filter(models.Aplicacion.estado == models.EstadoApp.EN_REVISION.value).count()
    
    ingresos_totales = db.query(func.sum(models.Transaccion.monto_pagado)).filter(models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value).scalar() or 0
    
    return {
        "usuarios": {
            "total": total_usuarios,
            "vendedores": total_vendedores,
            "compradores": total_compradores
        },
        "apps": {
            "total": total_apps,
            "activas": apps_activas,
            "en_revision": apps_revision
        },
        "ingresos_totales": ingresos_totales
    }

@router.get("/apps")
def get_all_apps(admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    return db.query(models.Aplicacion).order_by(models.Aplicacion.fecha_publicacion.desc()).all()

@router.get("/usuarios")
def get_all_users(admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    # No devolver el password_hash
    usuarios = db.query(models.Usuario).order_by(models.Usuario.id.desc()).all()
    result = []
    for u in usuarios:
        result.append({
            "id": u.id,
            "nombre": u.nombre,
            "correo": u.correo,
            "rol": u.rol,
            "plan_suscripcion": u.plan_suscripcion,
            "fecha_registro": u.fecha_ultima_actividad, # Proxy para fecha
            "telefono": u.telefono,
            "descripcion": u.descripcion,
            "consultas_ia": u.consultas_ia,
            "manuales_generados_mes": u.manuales_generados_mes,
            "sugerencias_precio_diarias": u.sugerencias_precio_diarias,
            "stripe_customer": u.stripe_customer
        })
    return result

@router.put("/apps/{app_id}/sello")
def toggle_sello_calidad(app_id: int, admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    app = db.query(models.Aplicacion).filter(models.Aplicacion.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="App no encontrada")
    
    app.sello_calidad = not app.sello_calidad
    db.commit()
    db.refresh(app)
    return {"message": "Sello de calidad actualizado", "sello_calidad": app.sello_calidad}

@router.get("/reportes")
def get_all_reports(admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    # Devolver reportes con info de la app y usuario
    reportes = db.query(models.Reporte).order_by(models.Reporte.fecha_creacion.desc()).all()
    result = []
    for r in reportes:
        result.append({
            "id": r.id,
            "motivo": r.motivo,
            "descripcion": r.descripcion,
            "estado": r.estado,
            "fecha_creacion": r.fecha_creacion,
            "app_id": r.aplicacion.id if r.aplicacion else None,
            "app_titulo": r.aplicacion.titulo if r.aplicacion else "Desconocida",
            "usuario_id": r.usuario_id,
            "usuario_nombre": r.usuario.nombre if r.usuario else "Desconocido"
        })
    return result

@router.put("/reportes/{reporte_id}/estado")
def update_report_status(reporte_id: int, estado: str, admin_id: int, db: Session = Depends(get_db)):
    verify_admin(admin_id, db)
    reporte = db.query(models.Reporte).filter(models.Reporte.id == reporte_id).first()
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    
    reporte.estado = estado
    db.commit()
    return {"message": "Estado del reporte actualizado", "estado": estado}

@router.post("/init-admin")
def init_admin(db: Session = Depends(get_db)):
    """Script para inicializar el admin por defecto."""
    admin = db.query(models.Usuario).filter(models.Usuario.correo == "admin@nexusapp.com").first()
    if admin:
        return {"message": "Admin ya existe", "email": admin.correo}
        
    from routers.auth import hash_password
    new_admin = models.Usuario(
        nombre="Super Admin",
        correo="admin@nexusapp.com",
        password_hash=hash_password("admin123"),
        rol=models.RolUsuario.ADMIN.value
    )
    db.add(new_admin)
    db.commit()
    return {"message": "Admin creado exitosamente", "email": "admin@nexusapp.com", "password": "admin123"}
