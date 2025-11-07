from flask import Blueprint, jsonify, request
from ..models.personaModels.personaModel import PersonaModel 
from mysql.connector.errors import IntegrityError 
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity



persona_bp = Blueprint('persona_bp', __name__)


## -----------------------------------------------------
## RUTA GET ALL (con paginación)
## -----------------------------------------------------
@persona_bp.route('/personas', methods=['GET'])
def get_personas():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        personas = PersonaModel.get_all_persons(page, per_page)
        return jsonify(personas), 200
    except Exception as e:
        print(f"Error en get_personas: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
# ... (Fin) ...


## ---------------------------------------------------------------------
## RUTA GET BY ID
## ---------------------------------------------------------------------
@persona_bp.route('/personas/<int:id_persona>', methods=['GET'])
def get_person(id_persona):
    try:
        persona = PersonaModel.get_persona_by_id(id_persona)
        if persona:
            return jsonify(persona), 200
        else:
            return jsonify({"error": "Persona no encontrada"}), 404
    except Exception as e:
        print(f"Error en get_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
# ... (Fin) ...



## -----------------------------------------------------
## RUTA UPDATE (PUT)
## -----------------------------------------------------
@persona_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def update_person(id_persona):

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

    try:
        # <<< 2. CORRECCIÓN: El modelo devuelve un dict, el controlador lo "jsonifica" >>>
        response_dict, status_code = PersonaModel.update_person(id_persona, data)
        return jsonify(response_dict), status_code
        
    except Exception as e:
        print(f"Error en update_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
#-----------------------------------------------------------------------


## -----------------------------------------------------
## RUTA DELETE 
## -----------------------------------------------------
@persona_bp.route('/personas/<int:id_persona>', methods=['DELETE'])
def delete_person(id_persona):

    try:
        # <<< 3. CORRECCIÓN: El modelo devuelve un dict, el controlador lo "jsonifica" >>>
        response_dict, status_code = PersonaModel.delete_person(id_persona)
        return jsonify(response_dict), status_code
        
    except Exception as e:
        print(f"Error en delete_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
#-----------------------------------------------------------------------



# =====================================================================
# GET Ranking
# =====================================================================
@persona_bp.route('/ranking', methods=['GET'])
@jwt_required()
def get_ranking_leaderboard():
    
    # Validar que el usuario del token existe
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str)
    except (ValueError, TypeError):
        return jsonify({"error": "Token inválido"}), 422

    if not PersonaModel.get_persona_by_id(id_persona_actual):
        return jsonify({"error": "Usuario del token no encontrado"}), 401
    
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        ranking_data = PersonaModel.get_ranking(page, per_page)
        
        return jsonify(ranking_data), 200

    except Exception as e:
        print(f"Error en GET /ranking: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# =====================================================================
#  NUEVA RUTA: Simulador de Juez (Temporal)
# =====================================================================
@persona_bp.route('/_dev/simular_aceptado', methods=['POST'])
@jwt_required() # (Idealmente protegido por ROL de Admin)
def dev_simular_juez():
    
    # (Validación de Admin/Tutor iría aquí)
    
    data = request.json
    if not data or not data.get('id_persona') or not data.get('puntaje_adicional'):
        return jsonify({"error": "Se requiere 'id_persona' y 'puntaje_adicional'"}), 400
        
    try:
        response, status_code = PersonaModel._developer_update_score(
            data['id_persona'],
            data['puntaje_adicional'],
            data.get('retos_adicionales', 1) # Opcional, por defecto 1
        )
        return jsonify(response), status_code
        
    except Exception as e:
        print(f"Error en POST /_dev/simular_aceptado: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500