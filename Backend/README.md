Backend del Sistema Multiplataforma "Codium"
Este repositorio contiene el código fuente del backend para el sistema Codium, una plataforma de retos de programación diseñada con una arquitectura moderna, segura y escalable. El backend está desarrollado en Python utilizando el framework Flask y sigue las mejores prácticas de seguridad y desarrollo de software.
Índice
Guía de Instalación y Puesta en Marcha
Descripción de Arquitectura y Dependencias
Uso de la API y Colección de Postman
Estándares y Flujo de Trabajo
Consideraciones de Seguridad
1. Guía de Instalación y Puesta en Marcha
Sigue estos pasos para configurar y ejecutar el proyecto en un entorno local.
Prerrequisitos
Python 3.8 o superior
Pip (gestor de paquetes de Python)
Git
Un servidor de base de datos MySQL
Pasos de Instalación
Clonar el repositorio:
code
Bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio/Backend
Crear y activar un entorno virtual:
code
Bash
# Crear el entorno
python -m venv entorno

# Activar en Windows
.\entorno\Scripts\activate

# Activar en macOS/Linux
source entorno/bin/activate
Instalar las dependencias:
code
Bash
pip install -r requerimientos.txt
Configurar la base de datos:
Asegúrate de que tu servidor MySQL esté en funcionamiento.
Crea una base de datos para el proyecto (ej. codium_db).
Ejecuta el script schema.sql para crear las tablas y roles necesarios.
Crea un archivo .env en la raíz del directorio Backend/ basándote en el archivo .env.example y configura tus credenciales de la base de datos y la clave secreta de JWT.
code
Code
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=tu_contraseña_segura
DB_NAME=codium_db
JWT_SECRET_KEY=tu_clave_secreta_jwt_muy_larga_y_segura
Ejecutar la aplicación:
code
Bash
flask run
La aplicación estará disponible en http://127.0.0.1:5000.
2. Descripción de Arquitectura y Dependencias
Arquitectura del Sistema
El backend está diseñado siguiendo una arquitectura orientada a microservicios, donde funcionalidades clave como la autenticación se han desacoplado en módulos independientes para mejorar la escalabilidad y el mantenimiento.
Modularidad con Flask Blueprints: La aplicación utiliza Blueprints para organizar las rutas y controladores en componentes lógicos (personaController, auth), haciendo que el código sea más limpio y fácil de gestionar.
Patrón de Diseño (similar a MVC):
Modelos (/src/models): Encapsulan la lógica de acceso y manipulación de datos, interactuando directamente con la base de datos.
Controladores (/src/routes): Manejan las peticiones HTTP, validan las entradas y coordinan la interacción entre los modelos y las respuestas de la API.
Servicios (/src/services): Contienen la lógica de negocio, como el microservicio de autenticación, para mantener los controladores ligeros.
Para una visualización completa y detallada de la arquitectura, consulte los diagramas del Modelo C4 en el directorio /docs/architecture/.
Dependencias Clave
Flask: Framework principal para la construcción de la API web.
Flask-JWT-Extended: Para la implementación de la autenticación basada en JSON Web Tokens (JWT).
Flask-Cors: Para gestionar las políticas de Cross-Origin Resource Sharing (CORS).
Werkzeug: Proporciona utilidades WSGI, incluyendo funciones seguras para el hashing de contraseñas.
mysql-connector-python: Conector oficial para la comunicación con la base de datos MySQL.
3. Uso de la API y Colección de Postman
Se proporciona una colección de Postman para facilitar las pruebas y la interacción con los endpoints de la API.
Cómo Utilizarla
Importar la Colección: Importa el archivo Codium_API.postman_collection.json (ubicado en /docs/) en tu cliente Postman.
Configurar el Entorno: La colección está diseñada para funcionar con un entorno de Postman. Configura una variable baseURL con el valor http://127.0.0.1:5000/api.
Probar los Endpoints: La colección incluye peticiones pre-configuradas para:
POST /register - Registrar un nuevo usuario.
POST /login - Iniciar sesión y obtener un token JWT.
POST /auth/google - Simular un registro/login con Google.
GET /profile - Acceder a una ruta protegida (requiere un Bearer Token).
Después de iniciar sesión, copia el token JWT recibido y añádelo en la pestaña "Authorization" (tipo "Bearer Token") de las peticiones a rutas protegidas.
4. Estándares y Flujo de Trabajo
Estándares de Codificación
El código sigue las convenciones de estilo de PEP 8.
Nomenclatura:
snake_case para variables, funciones y módulos.
PascalCase para clases.
Control de Versiones y Flujo GitFlow
El proyecto utiliza el flujo de trabajo GitFlow para gestionar el desarrollo de manera ordenada:
main: Rama estable que refleja el estado de producción.
develop: Rama principal de integración para nuevas funcionalidades.
feature/*: Ramas específicas para el desarrollo de cada nueva característica.
Se espera que los commits sean descriptivos y atómicos, facilitando la revisión y el seguimiento del historial del proyecto.
5. Consideraciones de Seguridad
La seguridad es un pilar fundamental de este proyecto. Se han implementado varias medidas basadas en las recomendaciones del OWASP Top 10.
A02: Fallas Criptográficas: Las contraseñas se almacenan utilizando un hashing seguro con la librería werkzeug.security. Nunca se guardan en texto plano.
A03: Inyección SQL: Todas las consultas a la base de datos son parametrizadas, lo que previene ataques de inyección de SQL.
A04: Diseño Inseguro: Se aplica el principio de menor privilegio. El usuario de la base de datos (app_user) tiene permisos limitados (CRUD), sin acceso a operaciones administrativas.
Autenticación JWT: El acceso a los endpoints sensibles está protegido y requiere un JSON Web Token válido, que se verifica en cada solicitud mediante un middleware.
Validación de Datos: Se realizan validaciones estrictas en los datos de entrada en todos los endpoints para prevenir la inyección de datos inesperados.

## Endpoints de la API (Colección Postman)

| Nombre del endpoint | Finalidad | Ruta | Respuesta |
| :--- | :--- | :--- | :--- |
| **Obtener Detalle Publicación** | Obtiene una publicación específica por ID, con sus comentarios y reacciones. | `GET /api/publicaciones/<id>` | `200 OK` (JSON del post) <br> `404 Not Found` |
| **Login de Usuario** | Autentica a un usuario con correo y contraseña. | `POST /api/login` | `200 OK` (JSON con token) <br> `401 Unauthorized` |
| **Obtener Retos** | Obtiene la lista paginada de todos los retos disponibles. | `GET /api/retos/` | `200 OK` (Array de retos) |
| **Enviar Solución de Reto** | Envía el código fuente de un usuario para un reto específico. | `POST /api/retos/<id>/submit` | `201 Created` (JSON con `id_respuesta`) <br> `400 Bad Request` |
| **Obtener Ranking** | Muestra la clasificación paginada de usuarios por puntaje. | `GET /api/ranking` | `200 OK` (Array de usuarios) |
| **Simular Reto Aceptado** | (Dev) Simula que un usuario completó un reto, sumando puntaje. | `POST /api/_dev/simular_aceptado` | `200 OK` (JSON con mensaje) |
| **Obtener Publicaciones (Feed)** | Obtiene la lista paginada de todas las publicaciones (el "feed"). | `GET /api/publicaciones/` | `200 OK` (Array de publicaciones) |
| **Reaccionar a Publicación** | Crea o actualiza la reacción de un usuario a una publicación. | `POST /api/publicaciones/<id>/reacciones` | `201 Created` (Creada) <br> `200 OK` (Actualizada) |
| **Comentar Publicación** | Agrega un nuevo comentario a una publicación específica. | `POST /api/publicaciones/<id>/comentarios` | `201 Created` (JSON con `id_comentario`) |