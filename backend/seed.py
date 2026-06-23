import asyncio
import random
import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models
from routers.auth import hash_password

def seed_database():
    print("Iniciando Seed de la Base de Datos...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()

    # 1. Limpiar datos existentes (opcional pero recomendado para empezar fresco)
    print("Limpiando DB (omitido en seed simple para no borrar admins reales)...")
    
    # 2. Crear Categorias
    print("Creando Categorías...")
    categorias_nombres = ["Aplicaciones Web", "Móvil e iOS", "Inteligencia Artificial", "Gestión Empresarial"]
    categorias_db = []
    for c_nombre in categorias_nombres:
        cat = db.query(models.Categoria).filter(models.Categoria.nombre == c_nombre).first()
        if not cat:
            cat = models.Categoria(nombre=c_nombre, descripcion=f"Apps enfocadas en {c_nombre}", icono="FaLaptopCode")
            db.add(cat)
            db.commit()
            db.refresh(cat)
        categorias_db.append(cat)

    # 3. Crear Usuarios
    print("Creando Usuarios...")
    usuarios_seed = [
        {"nombre": "Admin Master", "correo": "admin@nexus.com", "rol": models.RolUsuario.ADMIN.value},
        {"nombre": "Carlos Software (Vendedor)", "correo": "carlos@nexus.com", "rol": models.RolUsuario.VENDEDOR.value},
        {"nombre": "Tech Corp (Vendedor)", "correo": "techcorp@nexus.com", "rol": models.RolUsuario.VENDEDOR.value},
        {"nombre": "Juan Comprador", "correo": "juan@nexus.com", "rol": models.RolUsuario.COMPRADOR.value},
        {"nombre": "Maria Compradora", "correo": "maria@nexus.com", "rol": models.RolUsuario.COMPRADOR.value},
    ]

    usuarios_creados = []
    for u in usuarios_seed:
        db_user = db.query(models.Usuario).filter(models.Usuario.correo == u["correo"]).first()
        if not db_user:
            db_user = models.Usuario(
                nombre=u["nombre"],
                correo=u["correo"],
                password_hash=hash_password("123456"),
                rol=u["rol"],
                plan_suscripcion=models.PlanSuscripcion.PREMIUM.value if u["rol"] == models.RolUsuario.VENDEDOR.value else models.PlanSuscripcion.BASICO.value
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        usuarios_creados.append(db_user)

    vendedores = [u for u in usuarios_creados if u.rol == models.RolUsuario.VENDEDOR.value]
    compradores = [u for u in usuarios_creados if u.rol == models.RolUsuario.COMPRADOR.value]

    # 4. Crear Aplicaciones
    print("Creando Aplicaciones...")
    apps_seed = [
        {"titulo": "Sistema de Inventario Pro", "desc": "Gestión completa de inventarios.", "tech": "React, Node.js", "precio": 49.99, "img": "/uploads/images/ui_inventario.png"},
        {"titulo": "App de Delivery Express", "desc": "App móvil para repartidores.", "tech": "Flutter, Firebase", "precio": 99.99, "img": "/uploads/images/ui_delivery.png"},
        {"titulo": "Chatbot de IA para Ventas", "desc": "Bot conversacional para aumentar ventas.", "tech": "Python, FastAPI", "precio": 149.00, "img": "/uploads/images/ui_chatbot.png"},
        {"titulo": "CRM Empresarial Universitario", "desc": "CRM adaptado a universidades.", "tech": "Vue, Django", "precio": 199.99, "img": "/uploads/images/ui_crm.png"},
        {"titulo": "Punto de Venta Web", "desc": "POS completo para supermercados.", "tech": "React, PHP", "precio": 29.99, "img": "/uploads/images/ui_pos.png"},
        {"titulo": "Generador de Facturas IA", "desc": "Automatiza facturas usando OCR.", "tech": "Python, OpenCV", "precio": 89.00, "img": "/uploads/images/ui_facturas.png"},
        {"titulo": "E-commerce Template", "desc": "Plantilla de ecommerce fullstack.", "tech": "Next.js, Stripe", "precio": 59.99, "img": "/uploads/images/ui_ecommerce.png"},
        {"titulo": "Fitness App MVP", "desc": "Aplicación base para gimnasios.", "tech": "React Native", "precio": 39.99, "img": "/uploads/images/ui_fitness.png"},
    ]

    apps_creadas = []
    for i, app_data in enumerate(apps_seed):
        app_db = db.query(models.Aplicacion).filter(models.Aplicacion.titulo == app_data["titulo"]).first()
        if not app_db:
            app_db = models.Aplicacion(
                titulo=app_data["titulo"],
                descripcion=app_data["desc"] + " Lorem ipsum dolor sit amet consectetur adipiscing elit.",
                tecnologia=app_data["tech"],
                precio_sugerido=app_data["precio"] + 10,
                precio_venta=app_data["precio"],
                imagenes_urls=app_data["img"],
                vendedor_id=random.choice(vendedores).id,
                categoria_id=random.choice(categorias_db).id,
                sello_calidad=random.choice([True, False]),
                visitas=random.randint(10, 500)
            )
            db.add(app_db)
            db.commit()
            db.refresh(app_db)
        else:
            app_db.imagenes_urls = app_data["img"]
            db.commit()
            db.refresh(app_db)
        apps_creadas.append(app_db)

    # 5. Crear Transacciones y Reseñas
    print("Creando Transacciones y Reseñas...")
    for _ in range(15): # Crear 15 compras aleatorias
        app = random.choice(apps_creadas)
        comprador = random.choice(compradores)
        
        # Evitar compras duplicadas para simplificar
        trans_exist = db.query(models.Transaccion).filter_by(aplicacion_id=app.id, comprador_id=comprador.id).first()
        if not trans_exist:
            trans = models.Transaccion(
                monto_pagado=app.precio_venta,
                estado_pago=models.EstadoPago.COMPLETADO.value,
                aplicacion_id=app.id,
                comprador_id=comprador.id,
                fecha=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 30))
            )
            db.add(trans)
            
            # Dejar Reseña (80% de probabilidad)
            if random.random() > 0.2:
                resena = models.Resena(
                    estrellas=random.randint(3, 5),
                    comentario="¡Excelente aplicación! Funciona perfecto." if random.random() > 0.5 else "Muy buena, me ahorró mucho tiempo.",
                    aplicacion_id=app.id,
                    usuario_id=comprador.id
                )
                db.add(resena)
                
    db.commit()
    print("Base de datos poblada exitosamente!")
    db.close()

if __name__ == "__main__":
    seed_database()
