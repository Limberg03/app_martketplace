from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from typing import List

router = APIRouter(prefix="/api/reviews", tags=["Reseñas"])

@router.post("/", response_model=schemas.ResenaResponse, status_code=201)
def create_review(
    app_id: int, 
    usuario_id: int, 
    review: schemas.ResenaCreate, 
    db: Session = Depends(get_db)
):
    """CU18: Dejar reseña (solo si compró la app)."""
    # Verificar si compró la aplicación
    compro = db.query(models.Transaccion).filter(
        models.Transaccion.aplicacion_id == app_id,
        models.Transaccion.comprador_id == usuario_id,
        models.Transaccion.estado_pago == models.EstadoPago.COMPLETADO.value
    ).first()
    
    if not compro:
        raise HTTPException(status_code=403, detail="Debes comprar la aplicación para dejar una reseña.")
        
    # Verificar si ya dejó reseña
    ya_comento = db.query(models.Resena).filter(
        models.Resena.aplicacion_id == app_id,
        models.Resena.usuario_id == usuario_id
    ).first()
    if ya_comento:
        raise HTTPException(status_code=400, detail="Ya dejaste una reseña para esta aplicación.")
        
    nueva_resena = models.Resena(
        estrellas=review.estrellas,
        comentario=review.comentario,
        aplicacion_id=app_id,
        usuario_id=usuario_id
    )
    db.add(nueva_resena)
    db.commit()
    db.refresh(nueva_resena)
    
    return nueva_resena

@router.get("/{app_id}", response_model=List[schemas.ResenaResponse])
def get_reviews(app_id: int, db: Session = Depends(get_db)):
    """Obtener las reseñas de una aplicación."""
    return db.query(models.Resena).filter(models.Resena.aplicacion_id == app_id).all()
