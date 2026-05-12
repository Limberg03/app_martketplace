from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Usuario ---
class UserBase(BaseModel):
    nombre: str
    correo: EmailStr
    rol: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    correo: EmailStr
    password: str

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    correo: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    plan_suscripcion: str
    consultas_ia: int

    class Config:
        from_attributes = True

# --- Categoria ---
class CategoriaBase(BaseModel):
    nombre: str
    descripcion: str
    icono: str

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attributes = True

# --- Aplicacion ---
class AplicacionBase(BaseModel):
    titulo: str
    descripcion: str
    tecnologia: str
    precio_sugerido: float
    precio_venta: float
    url_codigo: Optional[str] = None
    url_manual: Optional[str] = None

class AplicacionCreate(AplicacionBase):
    categoria_id: int

class AplicacionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    precio_venta: Optional[float] = None
    estado: Optional[str] = None

class AplicacionResponse(AplicacionBase):
    id: int
    sello_calidad: bool
    fecha_publicacion: datetime
    visitas: int
    estado: str
    vendedor_id: int
    categoria_id: int

    class Config:
        from_attributes = True
