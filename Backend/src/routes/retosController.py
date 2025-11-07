# Backend/src/routes/retosController.py
from flask import Blueprint, jsonify, request
from ..models.personaModels.personaModel import PersonaModel 
from ..models.retosModels.retosModel import RetosModel
from ..models.retosModels.respuestaModel import RespuestaModel
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql

# Blueprint ahora definido SIN prefijo, se añade en app.py
retos_bp = Blueprint('retos_bp', __name__)


#-------------------------------------------------------------------------------
# RUTA POST para CREAR un nuevo reto
#-------------------------------------------------------------------------------
@retos_bp.route('/', methods=['POST'])
@jwt_required() 
def crear_nuevo_reto():
    
    # --- CORRECCIÓN INICIA ---
    #por lo pronto....
    # 1. Validar que el usuario del token existe y es un entero válido
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str) # Convertir de string a int
    except (ValueError, TypeError):
        return jsonify({"error": "Token inválido (identidad no numérica)"}), 422 # 422 Unprocessable Entity

    persona = PersonaModel.get_persona_by_id(id_persona_actual)
    if not persona:
        return jsonify({"error": "Usuario del token no encontrado"}), 401 # 401 Unauthorized
    # --- CORRECCIÓN TERMINA ---

    # (Opcional) Verificar Rol de Admin/Tutor
    # if persona['id_rol'] not in [1, 3]: # 1:Admin, 3:Tutor
    #     return jsonify({"error": "No tienes permisos para crear retos"}), 403

    data = request.json
    if not data:
        return jsonify({"error": "No se recibió ningún dato"}), 400

    required_keys = ['titulo', 'descripcion', 'nombre_dificultad', 'lenguajes', 'tests']
    if not all(k in data for k in required_keys):
        return jsonify({"error": "Faltan datos requeridos (titulo, descripcion, nombre_dificultad, lenguajes, tests)"}), 400

    try:
        response, status_code = RetosModel.create_reto(data)
        return jsonify(response), status_code
    
    except Exception as e:
        print(f"Error en retosController POST /: {e}")
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500


#-------------------------------------------------------------------------------
# RUTA GET para OBTENER TODOS los retos (con paginación)
#-------------------------------------------------------------------------------
@retos_bp.route('/', methods=['GET'])
@jwt_required() 
def get_retos():
    
    # --- CORRECCIÓN INICIA ---
    # Validar que el usuario del token existe y es un entero válido
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str) # Convertir de string a int
    except (ValueError, TypeError):
        return jsonify({"error": "Token inválido (identidad no numérica)"}), 422

    if not PersonaModel.get_persona_by_id(id_persona_actual):
        return jsonify({"error": "Usuario del token no encontrado"}), 401
    # --- CORRECCIÓN TERMINA ---

    try:
        # Obtener parámetros de paginación de la URL
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Llamar al modelo para obtener los retos
        lista_retos = RetosModel.get_all_retos(page, per_page)
        
        return jsonify(lista_retos), 200

    except Exception as e:
        print(f"Error en retosController GET /: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

#-------------------------------------------------------------------------------
# RUTA GET para OBTENER UN reto por su ID
#-------------------------------------------------------------------------------
@retos_bp.route('/<int:id_reto>', methods=['GET'])
@jwt_required() 
def get_reto(id_reto):
    
    # --- CORRECCIÓN INICIA ---
    # Validar que el usuario del token existe y es un entero válido
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str) # Convertir de string a int
    except (ValueError, TypeError):
        return jsonify({"error": "Token inválido (identidad no numérica)"}), 422

    if not PersonaModel.get_persona_by_id(id_persona_actual):
        return jsonify({"error": "Usuario del token no encontrado"}), 401
    # --- CORRECCIÓN TERMINA ---
    
    try:
        # Llamar al modelo para obtener el detalle del reto
        reto_detalle = RetosModel.get_reto_by_id(id_reto)
        
        if reto_detalle:
            return jsonify(reto_detalle), 200
        else:
            return jsonify({"error": "Reto no encontrado"}), 404

    except Exception as e:
        print(f"Error en retosController GET /<id>: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
    


#-------------------------------------------------------------------------------
# RUTA POST para ENVIAR (SUBMIT) una respuesta a un reto
#-------------------------------------------------------------------------------
@retos_bp.route('/<int:id_reto>/submit', methods=['POST'])
@jwt_required()
def submit_respuesta(id_reto):
    
    # 1. Validar identidad del usuario
    try:
        id_persona_str = get_jwt_identity()
        id_persona_actual = int(id_persona_str)
    except (ValueError, TypeError):
        return jsonify({"error": "Token inválido (identidad no numérica)"}), 422

    if not PersonaModel.get_persona_by_id(id_persona_actual):
        return jsonify({"error": "Usuario del token no encontrado"}), 401

    # 2. Obtener y validar el JSON de entrada
    data = request.json
    if not data:
        return jsonify({"error": "No se recibió ningún dato"}), 400
        
    codigo_fuente = data.get('codigo_fuente')
    id_lenguaje = data.get('id_lenguaje')

    if not codigo_fuente or not id_lenguaje:
        return jsonify({"error": "Faltan 'codigo_fuente' o 'id_lenguaje'"}), 400
    
    if not isinstance(id_lenguaje, int):
        return jsonify({"error": "'id_lenguaje' debe ser un número entero (ID)"}), 400

    # (Validación extra futura: ¿El id_lenguaje está permitido para este id_reto?)
    
    # 3. Llamar al modelo para crear el envío "Pendiente"
    try:
        response, status_code = RespuestaModel.create_submission(
            id_persona=id_persona_actual,
            id_reto=id_reto,
            id_lenguaje=id_lenguaje,
            codigo_fuente=codigo_fuente
        )
        return jsonify(response), status_code
        
    except Exception as e:
        print(f"Error en retosController POST /<id>/submit: {e}")
        return jsonify({"error": "Error interno del servidor", "detalle": str(e)}), 500