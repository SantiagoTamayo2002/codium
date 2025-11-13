# Backend/src/routes/publicacionController.py
from flask import Blueprint, jsonify, request
from ..models.personaModels import personaModel 
from ..models.interaccionSocialModels.publicacionModel import PublicacionModel
from flask_jwt_extended import jwt_required, get_jwt_identity

publicacion_bp = Blueprint('publicacion_bp', __name__)

def get_current_user_id():
    """ Función helper para obtener y validar la identidad del token """
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str)
        return id_persona_actual, None
    except (ValueError, TypeError):
        return None, jsonify({"error": "Token inválido (identidad no numérica)"}), 422

# --- RUTAS DE PUBLICACIONES (FEED) ---

@publicacion_bp.route('/', methods=['POST'])
@jwt_required()
def crear_publicacion():
    id_persona, error_response = get_current_user_id()
    if error_response: return error_response

    data = request.json
    contenido = data.get('contenido')
    if not contenido:
        return jsonify({"error": "El 'contenido' es requerido"}), 400
        
    try:
        response, status = PublicacionModel.create_post(id_persona, contenido)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@publicacion_bp.route('/', methods=['GET'])
@jwt_required()
def obtener_publicaciones():
    if get_current_user_id()[1]: # Solo validar token
        return get_current_user_id()[1]
        
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        response, status = PublicacionModel.get_all_posts(page, per_page)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@publicacion_bp.route('/<int:id_publicacion>', methods=['GET'])
@jwt_required()
def obtener_publicacion_detalle(id_publicacion):
    if get_current_user_id()[1]: # Solo validar token
        return get_current_user_id()[1]
        
    try:
        response, status = PublicacionModel.get_post_by_id(id_publicacion)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- RUTAS DE COMENTARIOS ---

@publicacion_bp.route('/<int:id_publicacion>/comentarios', methods=['POST'])
@jwt_required()
def crear_comentario(id_publicacion):
    id_persona, error_response = get_current_user_id()
    if error_response: return error_response

    data = request.json
    contenido = data.get('contenido')
    id_comentario_padre = data.get('id_comentario_padre') # Opcional
    if not contenido:
        return jsonify({"error": "El 'contenido' es requerido"}), 400

    try:
        response, status = PublicacionModel.create_comment(
            id_persona, id_publicacion, contenido, id_comentario_padre
        )
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- RUTAS DE REACCIONES ---

@publicacion_bp.route('/<int:id_publicacion>/reacciones', methods=['POST'])
@jwt_required()
def reaccionar_publicacion(id_publicacion):
    id_persona, error_response = get_current_user_id()
    if error_response: return error_response

    data = request.json
    id_tipo_reaccion = data.get('id_tipo_reaccion')
    if not id_tipo_reaccion:
        return jsonify({"error": "El 'id_tipo_reaccion' es requerido"}), 400

    try:
        response, status = PublicacionModel.set_reaction(
            id_persona, id_publicacion, id_tipo_reaccion
        )
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@publicacion_bp.route('/<int:id_publicacion>/reacciones', methods=['DELETE'])
@jwt_required()
def quitar_reaccion(id_publicacion):
    id_persona, error_response = get_current_user_id()
    if error_response: return error_response

    try:
        response, status = PublicacionModel.remove_reaction(id_persona, id_publicacion)
        return jsonify(response), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500