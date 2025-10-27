from flask import Blueprint, jsonify, request
from ..models.personaModel import PersonaModel 
from mysql.connector.errors import IntegrityError 
import re


from werkzeug.security import check_password_hash

from flask_jwt_extended import create_access_token

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
## RUTA CREATE (POST)
## -----------------------------------------------------
@persona_bp.route('/personas', methods=['POST'])
def create_person():
    data = request.get_json()
    # ... (Validaciones - sin cambios) ...
    if not data:
        return jsonify({"error": "No se proporcionaron datos"}), 400
    required_fields = ['nombre', 'apellidos', 'correo', 'contrasena_plana', 'nombre_usuario']
    for field in required_fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and data[field].strip() == ''):
            return jsonify({"error": f"Falta el campo requerido: {field}"}), 400
    correo = data['correo']
    if not isinstance(correo, str):
        return jsonify({"error": "Campo 'correo' debe ser texto (string)"}), 400
    correo = correo.strip()
    if '@' not in correo or '.' not in correo:
        return jsonify({"error": "Correo inválido: debe contener '@' y '.'"}), 400
    if not re.match(r'^[^@]+@[^@]+\.[^@]+$', correo):
        return jsonify({"error": "Correo inválido: formato incorrecto"}), 400
    nombre = data['nombre']
    apellidos = data['apellidos']
    if not isinstance(nombre, str):
        return jsonify({"error": "Campo 'nombre' debe ser texto (string)"}), 400
    if not isinstance(apellidos, str):
        return jsonify({"error": "Campo 'apellidos' debe ser texto (string)"}), 400
    nombre = nombre.strip()
    apellidos = apellidos.strip()
    nombre_pattern = r'^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$'
    if not re.match(nombre_pattern, nombre):
        return jsonify({"error": "El nombre solo debe contener letras y espacios"}), 400
    if not re.match(nombre_pattern, apellidos):
        return jsonify({"error": "Los apellidos solo deben contener letras y espacios"}), 400
    # ... (Fin Validaciones) ...

    try:
        contrasena_plana = data['contrasena_plana']
        nombre_usuario = data['nombre_usuario']
        token_refresco = data.get('token_refresco')
        id_rol = data.get('id_rol', 2)

        # <<< 1. CORRECCIÓN: El modelo devuelve un dict, el controlador lo "jsonifica" >>>
        response_dict, status_code = PersonaModel.create_person(
            nombre,
            apellidos,
            correo,
            contrasena_plana,
            nombre_usuario,
            token_refresco,
            id_rol
        )
        return jsonify(response_dict), status_code

    except KeyError as e:
        return jsonify({"error": f"Falta el campo: {str(e)}"}), 400
    except Exception as e:
        print(f"Error en create_person: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
#-----------------------------------------------------------------------------------------------


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
    

## -----------------------------------------------------
## RUTA AUTENTICACIÓN GOOGLE (Login/Registro)
## -----------------------------------------------------
# ... (Esta ruta ya era correcta y está bien) ...
@persona_bp.route('/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    
    # validación
    required_fields = ['nombre', 'apellidos', 'correo', 'contrasena_plana', 'nombre_usuario']
    for field in required_fields:
        if not data or field not in data:
            return jsonify({"error": f"Falta el campo de autenticación de Google: {field}"}), 400

    correo = data['correo'].strip()
    
    # buscar por email si el usuario ya existe
    try:
        persona = PersonaModel.get_person_by_email(correo)
    except Exception as e:
        print(f"Error al buscar persona por email: {e}")
        return jsonify({"error": "Error al buscar usuario en la base de datos"}), 500

    # Se logea o se registra
    if persona:
        # USUARIO EXISTE: LOGIN
        token_acceso = create_access_token(identity=persona['id_persona'])
        
        return jsonify({
            "message": "Inicio de sesión de Google exitoso", 
            "id_persona": persona['id_persona'],
            "nombre_usuario": persona['nombre_usuario'],
            "token": token_acceso
        }), 200
    else:
        # USUARIO NO EXISTE: REGISTRAR (CREATE)
        try:
            cleaned_nombre = data['nombre'].strip()
            cleaned_apellidos = data['apellidos'].strip()
            cleaned_nombre_usuario = data['nombre_usuario'].strip()

            response_dict, status_code = PersonaModel.create_person(
                cleaned_nombre,
                cleaned_apellidos,
                correo,
                data['contrasena_plana'], # ID de Google (sub), hasheado como "contraseña"
                cleaned_nombre_usuario,
                data.get('id_rol', 2)
            )
            
            # Si el registro fue exitoso (201 Created)
            if status_code == 201:
                new_person_id = response_dict.get('id_persona')
                
                if not new_person_id:
                     print("Error: create_person no devolvió 'id_persona' en el diccionario.")
                     return jsonify({"error": "Error de registro, ID no encontrado post-creación."}), 500
                
                token_acceso = create_access_token(identity=new_person_id)
                
                return jsonify({
                    "message": "Registro y login de Google exitoso", 
                    "id_persona": new_person_id,
                    "nombre_usuario": cleaned_nombre_usuario,
                    "token": token_acceso
                }), 201
            else:
                # Retornar errores del modelo (ej. 409 Conflict)
                return jsonify(response_dict), status_code

        except Exception as e:
            print(f"Error en google_auth/registro: {e}")
            return jsonify({"error": "Error interno al procesar el registro de Google"}), 500
#-----------------------------------------------------------------------

## -----------------------------------------------------
## RUTA LOGIN (Email/Password)
## -----------------------------------------------------
@persona_bp.route('/login', methods=['POST'])
def login_person():
    data = request.get_json()
    if not data or not data.get('correo') or not data.get('contrasena_plana'):
        return jsonify({"error": "Faltan campos 'correo' o 'contrasena_plana'"}), 400

    correo = data['correo'].strip()
    contrasena_plana = data['contrasena_plana']

    try:
        # 1. Usamos el método que ya tenías para obtener las credenciales
        user_credentials = PersonaModel.get_credentials(correo)

        # 2. Verificamos si el usuario existe Y la contraseña es correcta
        if not user_credentials or not check_password_hash(user_credentials['contraseña_hash'], contrasena_plana):
            # Es importante dar un mensaje genérico por seguridad
            return jsonify({"error": "Credenciales inválidas"}), 401 # Unauthorized

        # 3. Crear el token si las credenciales son válidas
        # El 'identity' es el id_persona que será guardado en el token
        access_token = create_access_token(identity=user_credentials['id_persona'])
        
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "token": access_token,
            "id_persona": user_credentials['id_persona']
        }), 200

    except Exception as e:
        print(f"Error en /login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500
