import sys
sys.path.insert(0, '.')

from database import engine
from sqlalchemy import text

migrations = [
    """
    CREATE TABLE IF NOT EXISTS visitas_app (
        id SERIAL PRIMARY KEY,
        aplicacion_id INTEGER REFERENCES aplicaciones(id),
        ip_visitante VARCHAR,
        usuario_id INTEGER REFERENCES usuarios(id),
        fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
    );
    """
]

with engine.connect() as conn:
    for sql in migrations:
        try:
            conn.execute(text(sql))
            print(f"OK: {sql.strip()}")
        except Exception as e:
            print(f"WARN: {e}")
    conn.commit()

print("Migracion de VisitaApp completada.")
