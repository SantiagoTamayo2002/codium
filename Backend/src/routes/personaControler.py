from flask import Blueprint, jsonify, request
from ..models.personaModel import PersonaModel 
# Asegúrate de importar el error de integridad para un manejo más limpio
from mysql.connector.errors import IntegrityError 

# Creamos un Blueprint para agrupar las rutas de persona
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

## -----------------------------------------------------
## RUTA GET BY ID
## -----------------------------------------------------
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

## -----------------------------------------------------
## RUTA CREATE (POST)
## -----------------------------------------------------
@persona_bp.route('/personas', methods=['POST'])
def create_person():

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se proporcionaron datos"}), 400


    required_fields = ['nombre', 'apellidos', 'correo', 'contrasena_plana', 'nombre_usuario']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Falta el campo requerido: {field}"}), 400

    try:
        nombre = data['nombre']
        apellidos = data['apellidos']
        correo = data['correo']
        contrasena_plana = data['contrasena_plana']
        nombre_usuario = data['nombre_usuario']
        
        # Campos opcionales
        token_refresco = data.get('token_refresco', None)
        id_rol = data.get('id_rol', 2) # Default a rol 'Usuario' (ID 2)

        # 3. Llamar al modelo
        # (Este modelo ya devuelve una respuesta jsonify)
        response, status_code = PersonaModel.create_person(
            nombre,
            apellidos,
            correo,
            contrasena_plana,
            nombre_usuario,
            token_refresco,
            id_rol
        )
        return response, status_code
        
    except KeyError as e:

        return jsonify({"error": f"Falta el campo: {str(e)}"}), 400
    except Exception as e:
        print(f"Error en create_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500


## -----------------------------------------------------
## RUTA UPDATE (PUT)
## -----------------------------------------------------
@persona_bp.route('/personas/<int:id_persona>', methods=['PUT'])
def update_person(id_persona):

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

    try:

        response, status_code = PersonaModel.update_person(id_persona, data)
        return response, status_code
        
    except Exception as e:
        print(f"Error en update_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

## -----------------------------------------------------
## RUTA DELETE 
## -----------------------------------------------------
@persona_bp.route('/personas/<int:id_persona>', methods=['DELETE'])
def delete_person(id_persona):

    try:

        response, status_code = PersonaModel.delete_person(id_persona)
        return response, status_code
        
    except Exception as e:
        print(f"Error en delete_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500