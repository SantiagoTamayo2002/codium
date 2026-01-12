from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# --- Importaciones CORRECTAS de Blueprints ---
from src.routes.personaController import persona_bp
from src.services.auth import auth_bp
from src.routes.retosController import retos_bp
from src.routes.publicacionController import publicacion_bp

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Por tu papi Tapia

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "clave_sh"
    )
    JWTManager(app)

    # ==============================
    # Registro de Blueprints
    # ==============================
    app.register_blueprint(persona_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(retos_bp, url_prefix="/api/retos")
    app.register_blueprint(publicacion_bp, url_prefix="/api/publicaciones")
    # ==============================

    # 🔎 DEBUG: ver rutas cargadas
    print(app.url_map)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
