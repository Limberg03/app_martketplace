from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["Autenticación y Usuarios"])

def get_password_hash(password: str):
    return password + "notreallyhashed"

def verify_password(plain_password, hashed_password):
    return plain_password + "notreallyhashed" == hashed_password

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    new_user = models.Usuario(
        nombre=user.nombre,
        correo=user.correo,
        password_hash=get_password_hash(user.password),
        rol=user.rol
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.UserResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return db_user

@router.post("/recover-password")
def recover_password(correo: str, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == correo).first()
    if not db_user:
        return {"message": "Si el correo existe, se ha enviado un enlace de recuperación."}
    return {"message": "Enlace de recuperación enviado exitosamente al correo."}

@router.put("/profile/{user_id}", response_model=schemas.UserResponse)
def update_profile(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_update.nombre:
        db_user.nombre = user_update.nombre
    if user_update.correo:
        email_check = db.query(models.Usuario).filter(models.Usuario.correo == user_update.correo).first()
        if email_check and email_check.id != user_id:
            raise HTTPException(status_code=400, detail="El nuevo correo ya está en uso")
        db_user.correo = user_update.correo
        
    db.commit()
    db.refresh(db_user)
    return db_user
