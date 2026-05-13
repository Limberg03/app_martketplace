"""
Script de migración: agrega la columna imagenes_urls a la tabla aplicaciones.
"""
import sys
sys.path.insert(0, '.')

from database import engine
from sqlalchemy import text

migrations = [
    "ALTER TABLE aplicaciones ADD COLUMN IF NOT EXISTS imagenes_urls TEXT;",
]

with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            print(f"OK: {sql}")
        except Exception as e:
            print(f"WARN: {sql}\n   -> {e}")
    conn.commit()

print("\nMigracion de imagenes_urls completada.")
