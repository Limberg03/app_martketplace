import os
from sqlalchemy import text
from database import engine

def upgrade():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN sugerencias_precio_diarias INTEGER DEFAULT 0"))
            print("Columna sugerencias_precio_diarias añadida")
        except Exception as e:
            print("Error o ya existe sugerencias_precio_diarias:", e)
        try:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN manuales_generados_mes INTEGER DEFAULT 0"))
            print("Columna manuales_generados_mes añadida")
        except Exception as e:
            print("Error o ya existe manuales_generados_mes:", e)
        try:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN fecha_ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            print("Columna fecha_ultima_actividad añadida")
        except Exception as e:
            print("Error o ya existe fecha_ultima_actividad:", e)

if __name__ == "__main__":
    upgrade()
