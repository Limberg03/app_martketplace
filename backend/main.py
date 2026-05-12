from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, apps, dashboard

# Crea las tablas en PostgreSQL si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Marketplace Académico API",
    description="API para el ecosistema de emprendimiento digital UAGRM",
    version="1.0.0"
)

# Configurar CORS para permitir que el Frontend (React) se comunique
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se debe cambiar al dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir las rutas de Autenticación y Usuarios (Casos de Uso)
app.include_router(auth.router)
app.include_router(apps.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "¡API de NexusApp funcionando correctamente!"}

@app.get("/health")
def health_check():
    return {"status": "ok", "db_connection": "Pendiente de configurar"}
