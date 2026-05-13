"""
Script para limpiar TODOS los datos de la base de datos.
Las tablas se conservan, solo se eliminan los registros.
"""
import sys
sys.path.insert(0, '.')

from database import engine
from sqlalchemy import text

# Orden correcto para respetar las foreign keys
tablas = [
    "historial_consultas",
    "notificaciones",
    "vectores_aplicacion",
    "resenas",
    "transacciones",
    "aplicaciones",
    "categorias",
    "usuarios",
]

with engine.connect() as conn:
    conn.execute(text("SET session_replication_role = 'replica';"))  # Desactiva FK checks
    for tabla in tablas:
        conn.execute(text(f"TRUNCATE TABLE {tabla} RESTART IDENTITY CASCADE;"))
        print(f"Limpiada: {tabla}")
    conn.execute(text("SET session_replication_role = 'origin';"))  # Reactiva FK checks
    conn.commit()

print("\nBase de datos limpia. Todas las tablas vacias.")
