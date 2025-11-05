import mysql
from ..database.db import get_db_connection



class PersonaModel:


    @classmethod
    def get_all_persons(cls, page=1, per_page=20):
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")
        
        cursor = conn.cursor(dictionary=True)
        try:
            offset = (page - 1) * per_page
            query = """
                SELECT id_persona, nombre, apellidos, correo, nombre_usuario, 
                       num_retos_resueltos, puntaje_total, id_rol 
                FROM PERSONA
                WHERE esta_activo = TRUE
            LIMIT %s OFFSET %s
            """
            cursor.execute(query, (per_page, offset))
            personas = cursor.fetchall()
            return personas
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            raise Exception("Error interno al consultar persona")
        finally:
            cursor.close()
            conn.close()
    

    @classmethod
    def get_persona_by_id(cls, id_persona):
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")

        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT id_persona, nombre, apellidos, correo, nombre_usuario, 
                       num_retos_resueltos, puntaje_total, id_rol 
                FROM PERSONA 
                WHERE id_persona = %s AND esta_activo = TRUE
            """
            cursor.execute(query, (id_persona,))
            persona = cursor.fetchone()
            if persona:
                return persona
            else:
                return None
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            raise Exception("Error interno al consultar persona")
        finally:
            cursor.close()
            conn.close()


<<<<<<< HEAD

    @classmethod
    def create_person(cls, 
                      nombre, 
                      apellidos, 
                      correo, 
                      contrasena_plana,  # <-- Renombrado para claridad
                      nombre_usuario,
                      token_refresco = None,
                      id_rol = 2):        # <-- El ID de rol 2 (Usuario) por defecto es buena idea

        conn = get_db_connection()
        if conn is None:
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conn.cursor()
        
        try:
            # Hashear la contraseña ANTES de la consulta
            # Recibimos texto plano, guardamos el hash
            hashed_password = generate_password_hash(contrasena_plana)
            
            # Query actualizada:
            # - Sin id_persona
            # - Sin num_retos_resueltos
            # - Sin puntaje_total
            query = """
                INSERT INTO persona (nombre, apellidos, correo, contraseña_hash, nombre_usuario, token_refresco, id_rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            # Tupla de valores actualizada
            cursor.execute(query, (nombre, apellidos, correo, hashed_password, nombre_usuario, token_refresco, id_rol))
            
            # Obtener el ID que SÍ se generó
            new_person_id = cursor.lastrowid
            
            conn.commit()
            
            # Retornar el ID real
            return jsonify({"message": "Persona creada exitosamente", "id_persona": new_person_id}), 201
        
        except mysql.connector.IntegrityError as e:
            # Manejar error de duplicado (para correo o nombre_usuario)
            if e.errno == 1062:
                # Mensaje de error más preciso
                if 'correo' in str(e):
                    return jsonify({"error": "El correo electrónico ya está registrado."}), 409
                elif 'nombre_usuario' in str(e):
                    return jsonify({"error": "El nombre de usuario ya existe."}), 409
                else:
                    return jsonify({"error": "Un valor único ya existe."}), 409
        
        except Exception as e:
            # Captura general de otros errores
            print(f"Error al ejecutar la consulta: {e}")
            conn.rollback() # Revertir cambios si algo salió mal
            return jsonify({"error": "Error interno al crear el usuario"}), 500   
        
        finally:
            cursor.close()
            conn.close()

    
=======
    

>>>>>>> origin/DEVELOPE

    @classmethod
    def update_person(cls, id_persona, update_data):
        conn = get_db_connection()
        if conn is None:
            # 9. CORREGIDO: Lanzar excepción
            raise Exception("No se pudo conectar a la base de datos")

<<<<<<< HEAD
        # --- INICIO DE CORRECCIÓN DE SEGURIDAD ---
        # Lista blanca de campos permitidos para actualización
        allowed_fields = ['nombre', 'apellidos', 'nombre_usuario', 'token_refresco', 'id_rol']
        
=======
        allowed_fields = ['nombre', 'apellidos', 'nombre_usuario', 'token_refresco']
>>>>>>> origin/DEVELOPE
        fields_to_update = []
        values = []

        for key, value in update_data.items():
            if key in allowed_fields:
                fields_to_update.append(f"{key} = %s")
                values.append(value)
            else:
                print(f"ADVERTENCIA: Intento de actualizar campo no permitido: {key}")

        if not fields_to_update:
            # 10. CORREGIDO: Devolver diccionario
            return {"error": "No se proporcionaron datos válidos para actualizar"}, 400

        cursor = conn.cursor()
        try:
            values.append(id_persona)
            query = f"UPDATE persona SET {', '.join(fields_to_update)} WHERE id_persona = %s AND esta_activo = TRUE"
            
            cursor.execute(query, tuple(values))
            
            if cursor.rowcount == 0:
                # 11. CORREGIDO: Devolver diccionario
                return {"error": "Persona no encontrada o inactiva"}, 404
            
            conn.commit()
            # 12. CORREGIDO: Devolver diccionario
            return {"message": "Persona actualizada"}, 200

        except mysql.connector.IntegrityError as e:
            # 13. CORREGIDO: Devolver diccionarios
            if e.errno == 1062:
                if 'correo' in str(e):
                    return {"error": "El correo electrónico ya está registrado."}, 409
                elif 'nombre_usuario' in str(e):
                    return {"error": "El nombre de usuario ya existe."}, 409
            return {"error": "Conflicto de datos."}, 409

        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            conn.rollback()
            # 14. CORREGIDO: Lanzar excepción
            raise Exception("Error interno al actualizar sus datos")
        finally:
            cursor.close()
            conn.close()


    @classmethod
    def delete_person(cls, id_persona):
        conn = get_db_connection()
        if conn is None:
            # 15. CORREGIDO: Lanzar excepción
            raise Exception("No se pudo conectar a la base de datos")

        cursor = conn.cursor()
        try:
            query = "UPDATE persona SET esta_activo = FALSE WHERE id_persona = %s"
            cursor.execute(query, (id_persona,))
            
            if cursor.rowcount == 0:
                # 16. CORREGIDO: Devolver diccionario
                return {"error": "Persona no encontrada"}, 404
            
            conn.commit()
            # 17. CORREGIDO: Devolver diccionario
            return {"message": "Persona desactivada"}, 200

        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            conn.rollback()
            # 18. CORREGIDO: Lanzar excepción
            raise Exception("Error interno al desactivar la persona")
        finally:
            cursor.close()
            conn.close()
    
    
    # --- Estos métodos ya eran correctos ---
    
    @classmethod
    def get_credentials(cls, correo):
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor(dictionary=True)
        try:
            query = "SELECT id_persona, contraseña_hash, id_rol FROM persona WHERE correo = %s AND esta_activo = TRUE"
            cursor.execute(query, (correo,))
            user = cursor.fetchone()
            return user
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            return None
        finally:
            cursor.close()
            conn.close()


    @classmethod
    def get_person_by_email(cls, correo):
        conn = get_db_connection()
        if conn is None:
            return None
        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT id_persona, nombre, apellidos, correo, nombre_usuario, 
                       num_retos_resueltos, puntaje_total, id_rol 
                FROM persona 
                WHERE correo = %s AND esta_activo = TRUE
            """
            cursor.execute(query, (correo,))
            person = cursor.fetchone()
            return person
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            return None
        finally:
            cursor.close()
            conn.close()


