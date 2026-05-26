import sys
import json
import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
from database import SessionLocal
from models import Aplicacion, EstadoApp
from services import ai_service

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

db = SessionLocal()
apps = db.query(Aplicacion).filter(Aplicacion.estado == EstadoApp.ACTIVA.value).all()
print("Apps activas:", [a.titulo for a in apps])

apps_data = [
    {"id": a.id, "titulo": a.titulo, "descripcion": a.descripcion, "tecnologia": a.tecnologia}
    for a in apps
]

res = ai_service.advanced_ai_search('construccion', apps_data)
print("Resultado de la función (parseado):", res)

print("\n--- RAW LLM TEST ---")
model = genai.GenerativeModel("gemini-2.5-flash")
apps_context = json.dumps([{"id": a["id"], "titulo": a["titulo"], "descripcion": a["descripcion"][:200], "tecnologia": a["tecnologia"]} for a in apps_data], ensure_ascii=False)
prompt = f"""
Eres una IA experta en recomendación de software de un marketplace.
El usuario está buscando: "construccion"

Aquí tienes la lista de aplicaciones disponibles en formato JSON:
{apps_context}

Tu tarea es encontrar hasta las 3 aplicaciones que mejor resuelvan el problema del usuario, analizando profundamente su título, descripción y tecnología.
Piensa "fuera de la caja": si el usuario busca "construcción", aplicaciones que analicen "planos" o generen "presupuestos" son altamente relevantes.

Debes devolver ÚNICAMENTE un array JSON válido con los IDs de las aplicaciones recomendadas y una breve pero convincente razón del porqué (máximo 15 palabras) con un tono profesional y "wow".

Formato esperado exacto:
[
  {{"id": 1, "razon": "Recomendado: Analiza planos 2D y genera presupuestos automáticos con alta precisión."}}
]
Si no hay ninguna aplicación que sirva ni remotamente, devuelve []. No incluyas bloques de código markdown como ```json o texto extra, SOLO el JSON crudo.
"""
try:
    response = model.generate_content(prompt)
    print("RAW TEXT:")
    print(repr(response.text))
except Exception as e:
    print("Error generating content:", e)
