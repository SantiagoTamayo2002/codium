from flask import Flask
from flask_cors import CORS 
from src.routes.personaControler import persona_bp 
from src.routes.authController import auth_bp
import os

# <<< 1. IMPORTAR JWT MANAGER >>>
# Añade la importación para flask-jwt-extended
from flask_jwt_extended import JWTManager


os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # ==========================================
    #      <<< 2. CONFIGURACIÓN DE JWT >>>
    # ==========================================
    
    # Define la clave secreta para firmar los tokens.
    # ¡MUY IMPORTANTE! Cambia esto en producción.
    # Lee desde una variable de entorno o un archivo de configuración.
    app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY', 'clave_sh') 

    # Inicializa JWTManager con tu aplicación 'app'
    jwt = JWTManager(app)
    
    # ==========================================
    #       <<< FIN CONFIGURACIÓN JWT >>>
    # ==========================================


    # Registrar Blueprints (Rutas)
    app.register_blueprint(persona_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')


    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
