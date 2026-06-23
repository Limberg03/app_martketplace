import os
from PIL import Image, ImageDraw

os.makedirs("uploads/images", exist_ok=True)

apps = {
    "ui_inventario.png": ("Inventario Pro", "#3b82f6", "#1e3a8a"),
    "ui_delivery.png": ("Delivery Express", "#10b981", "#064e3b"),
    "ui_chatbot.png": ("Chatbot IA", "#8b5cf6", "#4c1d95"),
    "ui_crm.png": ("CRM Universitario", "#f59e0b", "#78350f"),
    "ui_pos.png": ("Punto de Venta", "#ec4899", "#701a75"),
    "ui_facturas.png": ("Facturas IA", "#ef4444", "#7f1d1d"),
    "ui_ecommerce.png": ("E-commerce Template", "#14b8a6", "#115e59"),
    "ui_fitness.png": ("Fitness App", "#6366f1", "#312e81")
}

for filename, (title, color1, color2) in apps.items():
    # Crear un canvas de 800x500
    img = Image.new("RGB", (800, 500))
    draw = ImageDraw.Draw(img)
    
    # Dibujar degradado de color1 a color2 de arriba a abajo
    r1, g1, b1 = int(color1[1:3], 16), int(color1[3:5], 16), int(color1[5:7], 16)
    r2, g2, b2 = int(color2[1:3], 16), int(color2[3:5], 16), int(color2[5:7], 16)
    
    for y in range(500):
        ratio = y / 500.0
        r = int(r1 * (1 - ratio) + r2 * ratio)
        g = int(g1 * (1 - ratio) + g2 * ratio)
        b = int(b1 * (1 - ratio) + b2 * ratio)
        draw.line((0, y, 800, y), fill=(r, g, b))
        
    # Dibujar detalles de UI de mentira
    # Mock barra superior
    draw.rectangle([40, 40, 760, 80], fill="rgba(255, 255, 255, 0.1)", outline="rgba(255, 255, 255, 0.2)")
    draw.ellipse([60, 55, 70, 65], fill="#ef4444")
    draw.ellipse([80, 55, 90, 65], fill="#f59e0b")
    draw.ellipse([100, 55, 110, 65], fill="#10b981")
    
    # Mock contenedor de contenido
    draw.rectangle([40, 100, 760, 460], fill="rgba(255, 255, 255, 0.05)", outline="rgba(255, 255, 255, 0.1)")
    
    # Dibujar barras simulando graficos o cards
    draw.rectangle([80, 140, 360, 420], fill="rgba(255, 255, 255, 0.05)", outline="rgba(255, 255, 255, 0.1)")
    draw.rectangle([400, 140, 720, 260], fill="rgba(255, 255, 255, 0.05)", outline="rgba(255, 255, 255, 0.1)")
    draw.rectangle([400, 300, 720, 420], fill="rgba(255, 255, 255, 0.05)", outline="rgba(255, 255, 255, 0.1)")
    
    # Dibujar textos sencillos usando líneas y círculos
    draw.rectangle([100, 160, 340, 180], fill="rgba(255, 255, 255, 0.2)")
    draw.rectangle([100, 200, 240, 215], fill="rgba(255, 255, 255, 0.1)")
    draw.rectangle([100, 230, 280, 245], fill="rgba(255, 255, 255, 0.1)")
    
    draw.rectangle([420, 160, 680, 180], fill="rgba(255, 255, 255, 0.2)")
    draw.rectangle([420, 200, 560, 215], fill="rgba(255, 255, 255, 0.1)")
    
    # Escribir el título grande usando líneas simples
    # (Ya que default font de PIL es muy chiquito y no es escalable, dibujamos la silueta del texto o usaremos default de forma simple)
    try:
        # Intentar cargar una tipografía predeterminada si existe, si no, se usa la por defecto
        # de forma que al menos se lea algo de texto en la tarjeta
        from PIL import ImageFont
        font = ImageFont.load_default()
        draw.text((100, 320), title, fill="white", font=font)
    except Exception:
        draw.text((100, 320), title, fill="white")
        
    img.save(os.path.join("uploads/images", filename))
    print(f"Imagen generada con éxito: {filename}")
