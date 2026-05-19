from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
import os
from routers import auth, apps, dashboard

# Crea las tablas en PostgreSQL si no existen (incluye los nuevos campos de CU4/CU5)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Marketplace Académico API",
    description="API para el ecosistema de emprendimiento digital UAGRM",
    version="1.0.0"
)

# Configurar CORS para permitir que el Frontend (React) se comunique
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["https://app-martketplace.vercel.app"],
)

# Servir archivos estáticos (fotos de perfil, imágenes de apps, ZIPs)
os.makedirs("uploads/avatars", exist_ok=True)
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/zips", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Incluir las rutas de los módulos
app.include_router(auth.router)
app.include_router(apps.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "¡API de NexusApp funcionando correctamente!", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "ok", "db": "conectado"}
