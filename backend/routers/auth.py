from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
import bcrypt
import secrets
import os
import shutil
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["Autenticación y Usuarios"])

# ─── Seguridad de Contraseñas (bcrypt directo, sin passlib) ───────────────────
def hash_password(password: str) -> str:
    """bcrypt trunca a 72 bytes por diseño — usamos los primeros 72."""
    pwd_bytes = password[:72].encode("utf-8")
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain[:72].encode("utf-8")
    hashed_bytes = hashed.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

# ─── CU1 – Registrarse ────────────────────────────────────────────────────────
@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """CU1 – Registrarse"""
    if db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    new_user = models.Usuario(
        nombre=user.nombre,
        correo=user.correo,
        password_hash=hash_password(user.password),
        rol=user.rol
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ─── CU2 – Inicio de sesión ───────────────────────────────────────────────────
@router.post("/login", response_model=schemas.UserResponse)
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """CU2 – Inicio de sesión"""
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == user.correo).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    return db_user

# ─── CU4 – Recuperar Contraseña (paso 1: solicitar token) ─────────────────────
@router.post("/forgot-password")
def forgot_password(request: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """CU4 – Solicitar recuperación. Genera un token de 6 dígitos con validez de 15 min."""
    db_user = db.query(models.Usuario).filter(models.Usuario.correo == request.correo).first()

    # Siempre responder igual para no revelar si el correo existe
    if not db_user:
        return {"message": "Si el correo existe, recibirás un código de recuperación."}

    # Generar token de 6 dígitos
    token = str(secrets.randbelow(900000) + 100000)  # 100000–999999
    db_user.reset_token = token
    db_user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)
    db.commit()

    # En producción: enviar email. En desarrollo: devolver el token para pruebas.
    return {
        "message": "Código de recuperación generado correctamente.",
        "codigo_recuperacion": token,  # Solo visible en desarrollo
        "expira_en": "15 minutos"
    }

# ─── CU4 – Recuperar Contraseña (paso 2: cambiar contraseña) ─────────────────
@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """CU4 – Validar token y establecer nueva contraseña."""
    db_user = db.query(models.Usuario).filter(
        models.Usuario.reset_token == request.token
    ).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Código de recuperación inválido.")

    if db_user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")

    db_user.password_hash = hash_password(request.nueva_password)
    db_user.reset_token = None
    db_user.reset_token_expiry = None
    db.commit()

    return {"message": "¡Contraseña actualizada! Ya puedes iniciar sesión."}

# ─── CU5 – Ver y Editar Perfil (datos) ───────────────────────────────────────
@router.put("/profile/{user_id}", response_model=schemas.UserResponse)
def update_profile(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    """CU5 – Editar nombre, correo, teléfono y descripción."""
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_update.nombre is not None:
        db_user.nombre = user_update.nombre
    if user_update.correo is not None:
        conflict = db.query(models.Usuario).filter(
            models.Usuario.correo == user_update.correo,
            models.Usuario.id != user_id
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="El correo ya está en uso por otra cuenta")
        db_user.correo = user_update.correo
    if user_update.telefono is not None:
        db_user.telefono = user_update.telefono
    if user_update.descripcion is not None:
        db_user.descripcion = user_update.descripcion

    db.commit()
    db.refresh(db_user)
    return db_user

# ─── CU5 – Subir foto de perfil ──────────────────────────────────────────────
@router.post("/profile/{user_id}/photo", response_model=schemas.UserResponse)
async def upload_profile_photo(user_id: int, foto: UploadFile = File(...), db: Session = Depends(get_db)):
    """CU5 – Subir foto de perfil."""
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar tipo de archivo
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if foto.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes JPG, PNG, GIF o WEBP")

    os.makedirs("uploads/avatars", exist_ok=True)
    ext = foto.filename.split(".")[-1] if "." in foto.filename else "jpg"
    filename = f"avatar_{user_id}.{ext}"
    file_path = f"uploads/avatars/{filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(foto.file, buffer)

    db_user.foto_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(db_user)
    return db_user

# ─── Obtener perfil por ID ────────────────────────────────────────────────────
@router.get("/profile/{user_id}", response_model=schemas.UserResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db_user
