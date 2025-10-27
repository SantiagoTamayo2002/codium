from flask import Blueprint, jsonify
# Ya no importamos 'services.auth' ni 'flask-dance'
from ..models.personaModel import PersonaModel 

# <<< 1. IMPORTAR DECORADORES Y FUNCIONES DE JWT >>>
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/")
def index():
    # Esta ruta sigue siendo pública
    return jsonify({"message": "API de autenticación funcionando"}), 200

@auth_bp.route("/profile")
    
@jwt_required()
def profile():
    print("llego a profile")
    current_user_id = get_jwt_identity()

    try:
        # <<< 4. BUSCAR AL USUARIO EN LA BD CON ESE ID >>>
        persona = PersonaModel.get_persona_by_id(current_user_id)

        if not persona:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Opcional: No devolver información sensible
        if 'contrasena' in persona:
            del persona['contrasena']
        if 'token_refresco' in persona:
            del persona['token_refresco']

        # <<< 5. DEVOLVER LOS DATOS DEL PERFIL >>>
        return jsonify(persona), 200

    except Exception as e:
        print(f"Error en /profile: {e}")
        return jsonify({"error": "Error interno al obtener el perfil"}), 500

