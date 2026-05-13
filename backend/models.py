from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class RolUsuario(enum.Enum):
    VENDEDOR = "VENDEDOR"
    COMPRADOR = "COMPRADOR"
    ADMIN = "ADMIN"

class EstadoApp(enum.Enum):
    ACTIVA = "ACTIVA"
    INACTIVA = "INACTIVA"
    EN_REVISION = "EN_REVISION"

class EstadoPago(enum.Enum):
    PENDIENTE = "PENDIENTE"
    COMPLETADO = "COMPLETADO"
    FALLIDO = "FALLIDO"

class PlanSuscripcion(enum.Enum):
    BASICO = "BASICO"
    PREMIUM = "PREMIUM"

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    correo = Column(String, unique=True, index=True)
    password_hash = Column(String)
    rol = Column(String) # VENDEDOR | COMPRADOR | ADMIN
    plan_suscripcion = Column(String, default=PlanSuscripcion.BASICO.value)
    consultas_ia = Column(Integer, default=0)
    stripe_customer = Column(String, nullable=True)
    # Campos de perfil extendido (CU5)
    telefono = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)
    foto_url = Column(String, nullable=True)
    # Recuperación de contraseña (CU4)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)
    
    # Relaciones
    aplicaciones_publicadas = relationship("Aplicacion", back_populates="vendedor", foreign_keys='Aplicacion.vendedor_id')
    compras = relationship("Transaccion", back_populates="comprador", foreign_keys='Transaccion.comprador_id')
    resenas = relationship("Resena", back_populates="usuario")
    notificaciones = relationship("Notificacion", back_populates="usuario")
    historial_consultas = relationship("HistorialConsulta", back_populates="usuario")

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    descripcion = Column(String)
    icono = Column(String)
    
    aplicaciones = relationship("Aplicacion", back_populates="categoria")

class Aplicacion(Base):
    __tablename__ = "aplicaciones"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    descripcion = Column(Text)
    tecnologia = Column(String)
    precio_sugerido = Column(Float)
    precio_venta = Column(Float)
    url_codigo = Column(String, nullable=True)
    url_manual = Column(String, nullable=True)
    imagenes_urls = Column(Text, nullable=True)
    sello_calidad = Column(Boolean, default=False)
    fecha_publicacion = Column(DateTime, default=datetime.datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    visitas = Column(Integer, default=0)
    estado = Column(String, default=EstadoApp.ACTIVA.value)
    
    # Llaves foraneas
    vendedor_id = Column(Integer, ForeignKey("usuarios.id"))
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    
    vendedor = relationship("Usuario", back_populates="aplicaciones_publicadas")
    categoria = relationship("Categoria", back_populates="aplicaciones")
    transacciones = relationship("Transaccion", back_populates="aplicacion")
    resenas = relationship("Resena", back_populates="aplicacion")
    vectores = relationship("VectorAplicacion", back_populates="aplicacion")

class Transaccion(Base):
    __tablename__ = "transacciones"
    id = Column(Integer, primary_key=True, index=True)
    stripe_session_id = Column(String, nullable=True)
    monto_pagado = Column(Float)
    estado_pago = Column(String, default=EstadoPago.PENDIENTE.value)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    
    aplicacion_id = Column(Integer, ForeignKey("aplicaciones.id"))
    comprador_id = Column(Integer, ForeignKey("usuarios.id"))
    
    aplicacion = relationship("Aplicacion", back_populates="transacciones")
    comprador = relationship("Usuario", back_populates="compras")

class Resena(Base):
    __tablename__ = "resenas"
    id = Column(Integer, primary_key=True, index=True)
    estrellas = Column(Integer)
    comentario = Column(Text)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    
    aplicacion_id = Column(Integer, ForeignKey("aplicaciones.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    
    aplicacion = relationship("Aplicacion", back_populates="resenas")
    usuario = relationship("Usuario", back_populates="resenas")

class HistorialConsulta(Base):
    __tablename__ = "historial_consultas"
    id = Column(Integer, primary_key=True, index=True)
    texto_buscado = Column(String)
    fecha_consulta = Column(DateTime, default=datetime.datetime.utcnow)
    
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    usuario = relationship("Usuario", back_populates="historial_consultas")

class Notificacion(Base):
    __tablename__ = "notificaciones"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    mensaje = Column(Text)
    leido = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.datetime.utcnow)
    
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    usuario = relationship("Usuario", back_populates="notificaciones")

class VectorAplicacion(Base):
    __tablename__ = "vectores_aplicacion"
    id = Column(Integer, primary_key=True, index=True)
    tipo_fragmento = Column(String)
    contenido_texto = Column(Text)
    # embedding = Column(Vector(1536)) # Requiere pgvector, omitimos tipo especial por ahora para no romper compatibilidad local sin la extension
    
    aplicacion_id = Column(Integer, ForeignKey("aplicaciones.id"))
    aplicacion = relationship("Aplicacion", back_populates="vectores")

class VisitaApp(Base):
    __tablename__ = "visitas_app"
    id = Column(Integer, primary_key=True, index=True)
    aplicacion_id = Column(Integer, ForeignKey("aplicaciones.id"), index=True)
    ip_visitante = Column(String, index=True, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

