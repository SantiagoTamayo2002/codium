

# Backend/src/models/respuestaModel.py
import mysql
from ...database.db import get_db_connection
from datetime import datetime

class RespuestaModel:

    @classmethod
    def create_submission(cls, id_persona, id_reto, id_lenguaje, codigo_fuente):

        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")

        cursor = conn.cursor(dictionary=True)

        # Asumimos que 'Pendiente' es el ID 5 (o el ID que te haya dado el INSERT)
        # Sería mejor buscar el ID por nombre
        query_estado = "SELECT id_estado FROM ESTADO_RESPUESTA WHERE nombre_estado = 'Pendiente'"
        cursor.execute(query_estado)
        estado = cursor.fetchone()
        if not estado:
            raise Exception("Estado 'Pendiente' no encontrado en la base de datos")
        
        id_estado_pendiente = estado['id_estado']

        try:
            query_insert = """
                INSERT INTO RESPUESTA 
                    (codigo_fuente, fecha, puntaje, tiempo_ejecucion_ms, 
                     id_persona, id_reto, id_lenguaje, id_estado)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            fecha_ahora = datetime.utcnow()
            
            cursor.execute(query_insert, (
                codigo_fuente,
                fecha_ahora,
                0,           # Puntaje inicial
                None,        # Tiempo de ejecución (aún no se sabe)
                id_persona,
                id_reto,
                id_lenguaje,
                id_estado_pendiente
            ))
            
            new_submission_id = cursor.lastrowid
            conn.commit()
            
            return {"message": "Respuesta enviada para procesamiento", "id_respuesta": new_submission_id}, 201

        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Error de MySQL en create_submission: {err}")
            # Manejar errores de clave foránea (ej. lenguaje o reto no válido)
            if err.errno == 1452:
                return {"error": "El reto o el lenguaje especificado no es válido"}, 400
            return {"error": f"Error de base de datos: {err.msg}"}, 500
        except Exception as e:
            conn.rollback()
            print(f"Error inesperado en create_submission: {e}")
            raise Exception(f"Error interno al crear la respuesta: {e}")
        finally:
            cursor.close()
            conn.close()