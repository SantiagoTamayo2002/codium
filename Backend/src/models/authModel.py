import mysql
from ..database.db import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash


class authModel:


    #------------------------------------------------------------------------------------------------------------------
    #/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

 #------------------------------------------------------------------------------------------------------------------
    #/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    @classmethod
    def create_person(cls, 
                          nombre, 
                          apellidos, 
                          correo, 
                          contrasena_plana,
                          nombre_usuario,
                          token_refresco = None,
                          id_rol = 2):

        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")

        cursor = conn.cursor()
        
        try:
            hashed_password = generate_password_hash(contrasena_plana)
            
            query = """
                INSERT INTO persona (nombre, apellidos, correo, contraseña_hash, nombre_usuario, token_refresco, id_rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(query, (nombre, apellidos, correo, hashed_password, nombre_usuario, token_refresco, id_rol))
            
            new_person_id = cursor.lastrowid
            
            conn.commit()
            
            
            return {"message": "Persona creada exitosamente", "id_persona": new_person_id}, 201
        
        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                if 'correo' in str(e):
                    
                    return {"error": "El correo electrónico ya está registrado."}, 409
                elif 'nombre_usuario' in str(e):
                    
                    return {"error": "El nombre de usuario ya existe."}, 409
                else:
                    
                    return {"error": "Un valor único ya existe."}, 409
        
        except Exception as e:
            print(f"Error al ejecutar la consulta: {e}")
            conn.rollback() 
            # 8. CORREGIDO: Lanzar excepción
            raise Exception("Error interno al crear el usuario")
        
        finally:
            cursor.close()
            conn.close()
