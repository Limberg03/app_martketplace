"""Migración CU16: Crea la tabla historial_interacciones para el sistema de recomendaciones."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine
import models

models.Base.metadata.create_all(bind=engine)
print("OK: tabla historial_interacciones creada (o ya existia).")
