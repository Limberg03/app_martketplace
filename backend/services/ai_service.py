import os
import zipfile
import tempfile
import chromadb
import google.generativeai as genai
import json
import re
from typing import List, Dict, Any

# Configuración de Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

# Configuración de ChromaDB (Base de datos vectorial local)
CHROMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
# Usaremos una colección para las apps y su documentación
collection = chroma_client.get_or_create_collection(name="apps_collection")

def _extract_code_context(zip_path: str, max_files: int = 5, max_chars: int = 15000) -> str:
    """Extrae texto de archivos relevantes dentro de un ZIP para alimentar a la IA."""
    if not os.path.exists(zip_path):
        return "No se pudo encontrar el archivo ZIP."
    
    text_content = ""
    valid_extensions = ('.py', '.js', '.ts', '.html', '.css', '.md', '.json', '.java', '.php')
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            files = [f for f in zip_ref.namelist() if f.endswith(valid_extensions)]
            for file in files[:max_files]:
                if len(text_content) > max_chars:
                    break
                try:
                    with zip_ref.open(file) as f:
                        content = f.read().decode('utf-8', errors='ignore')
                        text_content += f"\n--- {file} ---\n{content[:3000]}\n"
                except Exception:
                    pass
    except Exception as e:
        return f"Error al leer ZIP: {e}"
        
    return text_content[:max_chars]

def suggest_price(titulo: str, descripcion: str, tecnologia: str, zip_path: str = None) -> str:
    """CU13: Sugiere un precio de venta para la aplicación."""
    if not GEMINI_API_KEY:
        return "Sugerencia IA (Simulada): Bs. 150 - Bs. 300"
        
    contexto_zip = ""
    if zip_path and os.path.exists(zip_path):
        contexto_zip = _extract_code_context(zip_path, max_files=4, max_chars=8000)
        
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""
    Eres un experto en evaluación de software para un MARKETPLACE ACADÉMICO UNIVERSITARIO en Bolivia.
    CONTEXTO CRÍTICO: 
    - Los vendedores son ESTUDIANTES UNIVERSITARIOS vendiendo el código fuente de sus proyectos semestrales, tesis o emprendimientos iniciales.
    - Los compradores son otros estudiantes o pequeños negocios locales con presupuesto limitado.
    - Los precios DEBEN ser simbólicos y muy accesibles. El rango normal es entre Bs. 50 y Bs. 1000. 
    - NUNCA sugieras precios corporativos exorbitantes (como Bs. 10,000 o Bs. 60,000), sin importar lo avanzado que suene el proyecto, porque sigue siendo un proyecto académico universitario sin soporte empresarial.
    
    Basado en los siguientes datos de esta aplicación académica, sugiere un rango de precio realista (en Bolivianos - Bs) para vender el código fuente.
    
    Título: {titulo}
    Descripción: {descripcion}
    Tecnologías: {tecnologia}
    """
    
    if contexto_zip:
        prompt += f"""
    Además, aquí tienes un extracto parcial del código fuente subido por el vendedor:
    {contexto_zip}
    Evalúa la calidad arquitectónica, complejidad de la base de datos o lógica de negocio mostrada en este código para dar un precio más preciso al valor real del sistema.
    """
    else:
        prompt += """
    (El usuario no ha subido el archivo ZIP todavía, por lo que debes estimar basado únicamente en el texto descriptivo proporcionado).
    """
        
    prompt += """
    Responde ÚNICAMENTE con el rango sugerido y una brevísima justificación de una o dos líneas. 
    Ejemplo: "Bs. 250 - Bs. 400. (Sistema complejo con alta demanda en Pymes locales. El código muestra buena estructura modular)."
    """
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error al generar sugerencia: {e}"

def analyze_code_for_quality(zip_path: str, titulo: str) -> bool:
    """CU15: Analiza si la app merece 'Sello Grado A'."""
    if not GEMINI_API_KEY:
        return True # Simulado
        
    context = _extract_code_context(zip_path)
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""
    Evalúa si la siguiente aplicación ("{titulo}") tiene una estructura de código aceptable para recibir un "Sello Grado A" (aprobado).
    Solo revisa si el código se ve coherente y bien estructurado.
    
    Código extraído (parcial):
    {context}
    
    Responde ÚNICAMENTE con "APROBADO" o "RECHAZADO".
    """
    try:
        response = model.generate_content(prompt)
        return "APROBADO" in response.text.upper()
    except Exception:
        return False

def generate_documentation(zip_path: str, titulo: str) -> str:
    """CU14: Genera un manual de usuario a partir del código."""
    if not GEMINI_API_KEY:
        return f"# Manual de {titulo}\n\nDocumentación generada automáticamente."
        
    context = _extract_code_context(zip_path)
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""
    Eres un Technical Writer. Genera un breve Manual de Usuario en formato Markdown puro para la aplicación '{titulo}'.
    Usa este código fuente parcial como contexto para entender qué hace:
    
    {context}
    
    Incluye estrictamente estas secciones con formato `#`:
    - Descripción General
    - Requisitos o Tecnologías
    - Guía de Uso Básica
    
    INSTRUCCIÓN CRÍTICA: NO incluyas ninguna introducción conversacional, ni saludos, ni explicaciones previas como "Aquí tienes el manual" o "Como technical writer he analizado". Empieza INMEDIATAMENTE con `# Manual de Usuario`. Tu respuesta debe ser SOLO código Markdown válido.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error al generar documentación: {e}"

def index_app_for_search(app_id: int, titulo: str, descripcion: str, tecnologia: str, manual_text: str):
    """Indexa la app en ChromaDB para búsqueda semántica y RAG."""
    # Combinamos la metadata para crear el vector
    document_text = f"Título: {titulo}\nDescripción: {descripcion}\nTecnologías: {tecnologia}\n\nManual/Contexto:\n{manual_text}"
    
    collection.upsert(
        documents=[document_text],
        metadatas=[{"app_id": app_id, "titulo": titulo}],
        ids=[str(app_id)]
    )

def semantic_search(query: str, n_results: int = 3) -> List[int]:
    """CU12: Búsqueda Semántica clásica que retorna los IDs de las apps relevantes."""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        if results['metadatas'] and len(results['metadatas']) > 0:
            # Extraer los app_id
            metadatas = results['metadatas'][0]
            app_ids = [meta['app_id'] for meta in metadatas]
            return app_ids
        return []
    except Exception:
        return []

def advanced_ai_search(query: str, apps_data: List[Dict[str, Any]], limit: int = 3) -> List[Dict[str, Any]]:
    """Búsqueda IA Avanzada que evalúa el contexto de todas las apps y genera razones."""
    if not GEMINI_API_KEY or not apps_data:
        return []
        
    model = genai.GenerativeModel(MODEL_NAME)
    
    # Reducimos los datos al mínimo necesario para ahorrar tokens
    context_data = [
        {"id": a["id"], "titulo": a["titulo"], "descripcion": a["descripcion"][:200], "tecnologia": a["tecnologia"]}
        for a in apps_data
    ]
    apps_context = json.dumps(context_data, ensure_ascii=False)
    
    prompt = f"""
    Eres una IA experta en recomendación de software de un marketplace.
    El usuario está buscando: "{query}"
    
    Aquí tienes la lista de aplicaciones disponibles en formato JSON:
    {apps_context}
    
    Tu tarea es encontrar hasta las {limit} aplicaciones que mejor resuelvan el problema del usuario, analizando profundamente su título, descripción y tecnología.
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
        text = response.text.strip()
        
        # Extracción robusta de JSON usando expresiones regulares
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            json_text = match.group(0)
            results = json.loads(json_text)
            return results
        else:
            print("No se encontró un array JSON en la respuesta de la IA.")
            return []
    except Exception as e:
        print(f"Error en advanced_ai_search: {e}")
        return []

def chat_rag_app(app_id: int, user_query: str, zip_path: str = None) -> str:
    """CU17: RAG Chat. Responde una pregunta usando el contexto de ChromaDB y extractos del código fuente real."""
    if not GEMINI_API_KEY:
        return "Chat IA (Simulado): No tengo respuesta en este momento."
        
    try:
        # Recuperar documento de ChromaDB (contiene Título, Descripción y Manual Generado)
        result = collection.get(ids=[str(app_id)])
        context = ""
        if result['documents'] and len(result['documents']) > 0:
            context = result['documents'][0]
            
        # Novedad: Extraer código directamente del ZIP si existe
        codigo_context = ""
        if zip_path and os.path.exists(zip_path):
            codigo_context = _extract_code_context(zip_path, max_files=10, max_chars=25000)
            
        model = genai.GenerativeModel(MODEL_NAME)
        prompt = f"""
        Eres el ingeniero en jefe y asistente técnico experto de esta aplicación en un marketplace. Un usuario potencial tiene una duda.
        
        Toda la información que tienes disponible sobre la aplicación:
        {context}
        """
        
        if codigo_context:
            prompt += f"""
        
        Además, he inspeccionado el código fuente directamente (ZIP) y aquí tienes algunos extractos críticos de sus archivos:
        {codigo_context}
        
        Usa ESTOS extractos de código para responder de forma técnica y exacta.
        """
        
        prompt += f"""
        REGLAS ESTRICTAS PARA TU RESPUESTA:
        1. RESPONDE DE MANERA DIRECTA Y AL GRANO.
        2. NO uses introducciones, saludos ni despedidas (ej. "¡Hola!", "Es una excelente pregunta", "Como ingeniero en jefe...").
        3. Ve directamente a la respuesta técnica basándote en la información.
        4. Sé conciso pero técnico.
        5. OBLIGATORIO: Al final de tu respuesta, agrega una conclusión resumida y clara (1 o 2 oraciones) con el veredicto final a la pregunta del usuario.
        
        Pregunta del usuario: {user_query}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error en el chat: {e}"

def generate_recommendations(perfil_intereses: Dict[str, int], apps_data: List[Dict[str, Any]], excluir_ids: List[int] = []) -> List[Dict[str, Any]]:
    """CU16: Genera recomendaciones personalizadas basadas en el perfil de intereses del usuario.
    
    Args:
        perfil_intereses: Dict {titulo_app: puntos_totales} — el "mapa de interés" del usuario.
        apps_data: Lista de todas las apps activas disponibles.
        excluir_ids: IDs de apps que el usuario ya visitó/compró (para no repetirlas).
    """
    if not GEMINI_API_KEY or not apps_data:
        # Simulación: devolver primeras 4 apps
        return [{"id": a["id"], "razon": "Recomendado para ti"} for a in apps_data[:4]]
    
    # Filtrar apps que el usuario ya vio o compró
    apps_nuevas = [a for a in apps_data if a["id"] not in excluir_ids]
    if not apps_nuevas:
        return []
    
    # Construir perfil legible para la IA (ordenado por mayor interés)
    perfil_sorted = sorted(perfil_intereses.items(), key=lambda x: x[1], reverse=True)
    perfil_texto = "\n".join([f"- {titulo}: {pts} puntos de interés" for titulo, pts in perfil_sorted[:8]])
    
    # Preparar lista de apps candidatas para la IA
    apps_context = json.dumps([
        {"id": a["id"], "titulo": a["titulo"], "descripcion": a["descripcion"][:180], "tecnologia": a["tecnologia"]}
        for a in apps_nuevas[:20]  # Máximo 20 para no gastar demasiados tokens
    ], ensure_ascii=False)
    
    model = genai.GenerativeModel(MODEL_NAME)
    prompt = f"""
    Eres un motor de recomendaciones de un marketplace de software universitario.
    
    PERFIL DE INTERESES DEL USUARIO (basado en sus visitas, lectura de documentación y compras):
    {perfil_texto}
    
    APLICACIONES DISPONIBLES EN EL MARKETPLACE (que el usuario aún NO ha visto):
    {apps_context}
    
    Tu tarea: selecciona las 4 aplicaciones más relevantes para este usuario basándote en su perfil de intereses.
    Para cada recomendación, escribe una razón corta y personalizada (máximo 12 palabras) que mencione su conexión con lo que ya le interesó.
    
    Formato de respuesta OBLIGATORIO (solo el JSON, sin markdown):
    [{{"id": 1, "razon": "Similar al sistema ecommerce que revisaste, con módulo de pagos."}}]
    
    Si no hay apps relevantes, devuelve []. Devuelve SOLO el JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return []
    except Exception as e:
        print(f"Error en generate_recommendations: {e}")
        return []

