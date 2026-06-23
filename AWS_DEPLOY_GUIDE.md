# Guía de Despliegue en AWS EC2 (Docker & Docker Compose)

Esta guía te guiará paso a paso para subir y desplegar el **Marketplace UAGRM (NexusApp)** en tu instancia de AWS EC2 utilizando los archivos de Docker creados.

---

## PASO 1: Subir los archivos creados a tu Repositorio de Git
En tu **computadora local (Windows)** donde tienes el código, realiza un commit y push para subir el soporte de Docker a GitHub/GitLab:

```bash
git add .
git commit -m "feat: agregar Dockerfiles, nginx y docker-compose para AWS"
git push origin master
```
*(Nota: Ajusta `master` al nombre de tu rama principal si usas `main` u otra).*

---

## PASO 2: Instalar Docker y Git en el Servidor AWS EC2
En tu terminal SSH de Ubuntu (la de la imagen que enviaste), ejecuta los siguientes comandos para actualizar el sistema e instalar Docker y Git:

```bash
# 1. Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker, Docker Compose y Git
sudo apt install -y docker.io docker-compose-v2 git

# 3. Iniciar y habilitar el servicio de Docker
sudo systemctl start docker
sudo systemctl enable docker

# 4. Dar permisos a tu usuario "ubuntu" para correr Docker sin usar 'sudo'
sudo usermod -aG docker $USER

# 5. IMPORTANTE: Cierra la conexión SSH actual con el comando 'exit' 
# y vuelve a conectarte para que los cambios de permisos surtan efecto.
exit
```

---

## PASO 3: Clonar el repositorio en AWS
Una vez que hayas vuelto a iniciar sesión por SSH, clona tu repositorio en la carpeta de usuario:

```bash
# Clonar repositorio (reemplaza por la URL real de tu Git)
git clone <URL_DE_TU_REPOSITORIO_GIT>

# Entrar a la carpeta del proyecto
cd app_martketplace
```
*(Si ya tenías el proyecto clonado en el servidor, solo entra a la carpeta y haz `git pull`)*.

---

## PASO 4: Crear el Archivo de Variables de Entorno `.env`
Crea el archivo `.env` en la raíz del proyecto para indicarle a Docker tus llaves de API:

```bash
nano .env
```

Pega el siguiente contenido (reemplaza con tus API Keys reales):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=68867805
POSTGRES_DB=marketplace_db

# Tu API Key de Groq
GROQ_API_KEY=gsk_tu_api_key_aqui
GROQ_MODEL=llama-3.3-70b-versatile

# Stripe API Keys (opcional para pruebas locales/simulación)
STRIPE_SECRET_KEY=sk_test_tu_llave_de_stripe

# Credenciales VAPID para notificaciones Push
VAPID_PUBLIC_KEY=tu_clave_publica_vapid
VAPID_PRIVATE_KEY=tu_clave_privada_vapid
VAPID_CLAIMS_EMAIL=mailto:admin@uagrm.edu.bo
```

*Para guardar en `nano`: presiona `Ctrl + O`, luego `Enter`. Para salir, presiona `Ctrl + X`.*

---

## PASO 5: Levantar la Aplicación
Arranca los tres contenedores (Base de datos, Backend y Frontend) en segundo plano:

```bash
docker compose up --build -d
```
Docker descargará las imágenes base, compilará tu backend de FastAPI, compilará tu aplicación React/Vite en Node, y levantará el servidor Nginx de producción.

Puedes verificar que los contenedores estén corriendo con:
```bash
docker ps
```

---

## PASO 6: Inicializar la Base de Datos con Datos de Prueba (Seed)
Una vez que los contenedores estén arriba y en ejecución, ejecuta el script de semillas dentro del contenedor del backend para poblar las categorías y crear los usuarios de prueba:

```bash
docker exec -it nexusapp_backend python seed.py
```

---

## PASO 7: Configurar el Grupo de Seguridad de AWS (Security Group)
Para que puedas acceder a la aplicación desde tu navegador:
1. Entra a tu **consola de AWS**.
2. Ve a **EC2 -> Instances** y selecciona tu instancia.
3. En la pestaña **Security**, haz clic en tu **Security Group**.
4. Haz clic en **Edit inbound rules** (Editar reglas de entrada).
5. Agrega las siguientes reglas:
   * **HTTP**: Port `80`, Source `Anywhere-IPv4 (0.0.0.0/0)`.
   * **HTTPS**: Port `443`, Source `Anywhere-IPv4 (0.0.0.0/0)` (si decides agregar un certificado SSL en el futuro).

---

¡Listo! Ya podrás ingresar al navegador escribiendo la **IP Pública** de tu servidor AWS EC2 (ej. `http://54.210.xx.xx/`) y verás la aplicación web funcionando con la API integrada.
