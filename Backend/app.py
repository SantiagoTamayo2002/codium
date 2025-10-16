
from flask import Flask
from flask_cors import CORS 
from src.routes.personaControler import persona_bp 

def create_app():
    app = Flask(__name__)
    CORS(app) 

    # Registrar Blueprints (Rutas)
    app.register_blueprint(persona_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)