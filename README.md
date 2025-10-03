# codium

# Requerimientos
- Gestión de usuarios
- Registro, inicio de sesión y perfiles personales.
- Visualización de estadísticas (puntos, nivel, ranking, retos completados).
- Sistema de retos
- Envío de retos en horarios aleatorios vía notificación o correo.
- Retos con enunciado, tiempo límite y nivel de dificultad.
- Ajuste automático de la dificultad según el desempeño del usuario.
- Gamificación
- Ranking global.
- Sistema de niveles: fácil, intermedio y difícil.
- Bonificaciones: rachas diarias, puntos extra por rapidez.
- Límite de intentos diarios configurable con bonificaciones adicionales.
- Sistema de puntuación
- Asignación de puntos según tiempo y precisión.
- Bonos por completar los 3 retos diarios sin errores.
- Panel de administración
- Creación, edición y eliminación de retos.
- Visualización de estadísticas generales (usuarios activos, tasa de resolución, ranking).

# Arquitectura
- Se utilizara la arquitectura cliente-servidor debido a un analisis previo utilizando el modelo C4

# Estandares
- 

# Flujo Gitflow
- 

# Instrucciones de Ejecucion
- Inicio del servidor
    Para iniciar la aplicación del servidor (backend) seguir el siguiente instructivo
    1. crear un entorno virtual con el nombre que prefieras dentro de la carpeta Backend
    2. Ejecutar pip install -r requerimientos.txt
    3. Ejecutar python Backend_app.py cambiar la privacidad de visibilidad de la aplicación para evitar ejecución
    de código malisioso.

- Inicio del cliente (Frontend)
    Para iniciar la aplicación del servidor cliente (Frontend) seguir el siguiente instructivo
    1. ejecutar el comando "npm install" requerido para instalar las dependencias necesarias
    2. Ejecutar el comando "npm run dev" para ejecutar la aplicación