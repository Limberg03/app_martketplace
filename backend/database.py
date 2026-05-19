import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Obtenemos la URL de la base de datos desde las variables de entorno (Render).
# Si no existe, usamos la local por defecto.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:68867805@localhost:5432/marketplace_db")

# Render usa "postgres://" por defecto, pero SQLAlchemy requiere "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para inyectar la sesión en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
