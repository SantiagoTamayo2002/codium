import mysql
from ...database.db import get_db_connection



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


    


    @classmethod
    def update_person(cls, id_persona, update_data):
        conn = get_db_connection()
        if conn is None:
            # 9. CORREGIDO: Lanzar excepción
            raise Exception("No se pudo conectar a la base de datos")

        allowed_fields = ['nombre', 'apellidos', 'nombre_usuario', 'token_refresco']
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




    @classmethod
    def get_ranking(cls, page=1, per_page=10):
        """
        Obtiene la lista de usuarios ordenados por puntaje (ranking).
        """
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")
        
        cursor = conn.cursor(dictionary=True)
        try:
            offset = (page - 1) * per_page
            
            # Ordenamos por puntaje (desc), luego por retos resueltos (desc),
            # y finalmente por id (asc) para un orden consistente.
            query = """
                SELECT 
                    id_persona, 
                    nombre_usuario, 
                    puntaje_total, 
                    num_retos_resueltos
                FROM PERSONA
                WHERE esta_activo = TRUE
                ORDER BY 
                    puntaje_total DESC, 
                    num_retos_resueltos DESC, 
                    id_persona ASC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (per_page, offset))
            ranking = cursor.fetchall()
            return ranking
        
        except Exception as e:
            print(f"Error al ejecutar consulta en get_ranking: {e}")
            raise Exception("Error interno al consultar el ranking")
        finally:
            cursor.close()
            conn.close()



    # =====================================================================
    # Simulador de Juez (Temporal)
    # =====================================================================
    @classmethod
    def _developer_update_score(cls, id_persona, puntaje_adicional, retos_adicionales=1):
        """
        Simula que el Juez ha aceptado una respuesta, actualizando
        directamente el puntaje y el número de retos del usuario.
        """
        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")
        
        cursor = conn.cursor()
        try:
            query = """
                UPDATE PERSONA
                SET 
                    puntaje_total = puntaje_total + %s,
                    num_retos_resueltos = num_retos_resueltos + %s
                WHERE id_persona = %s
            """
            cursor.execute(query, (puntaje_adicional, retos_adicionales, id_persona))
            
            if cursor.rowcount == 0:
                 return {"error": "Persona no encontrada"}, 404
                 
            conn.commit()
            return {"message": "Puntaje actualizado (simulación de Juez)"}, 200

        except Exception as e:
            print(f"Error al ejecutar consulta en _developer_update_score: {e}")
            conn.rollback()
            raise Exception("Error interno al actualizar puntaje")
        finally:
            cursor.close()
            conn.close()