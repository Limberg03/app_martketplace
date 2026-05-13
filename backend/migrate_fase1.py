"""
Script de migración: agrega columnas nuevas a la tabla 'usuarios'
para CU4 (reset_token, reset_token_expiry) y CU5 (telefono, descripcion, foto_url).
Ejecutar una sola vez.
"""
import sys
sys.path.insert(0, '.')

from database import engine
from sqlalchemy import text

migrations = [
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR;",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS descripcion TEXT;",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url VARCHAR;",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token VARCHAR;",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;",
]

with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            print(f"OK: {sql}")
        except Exception as e:
            print(f"WARN: {sql}\n   -> {e}")
    conn.commit()

print("\nMigracion completada.")
