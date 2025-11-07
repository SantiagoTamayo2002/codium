# Backend/src/models/publicacionModel.py
import mysql
from ...database.db import get_db_connection
from datetime import datetime

class PublicacionModel:

    # =====================================================================
    #  MÉTODOS PARA PUBLICACIONES
    # =====================================================================

    @classmethod
    def create_post(cls, id_persona, contenido):
        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")
        cursor = conn.cursor()
        try:
            query = """
                INSERT INTO PUBLICACION (contenido, fecha, id_persona)
                VALUES (%s, %s, %s)
            """
            fecha_ahora = datetime.utcnow()
            cursor.execute(query, (contenido, fecha_ahora, id_persona))
            new_post_id = cursor.lastrowid
            conn.commit()
            return {"message": "Publicación creada", "id_publicacion": new_post_id}, 201
            
        except Exception as e:
            conn.rollback()
            print(f"Error en create_post: {e}")
            raise Exception(f"Error interno al crear la publicación: {e}")
        finally:
            cursor.close()
            conn.close()

    @classmethod
    def get_all_posts(cls, page=1, per_page=10):
        """ Obtiene un 'feed' de publicaciones, uniendo con el autor """
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")
        
        cursor = conn.cursor(dictionary=True)
        try:
            offset = (page - 1) * per_page
            query = """
                SELECT 
                    p.id_publicacion, 
                    p.contenido, 
                    p.fecha,
                    per.id_persona,
                    per.nombre_usuario
                FROM PUBLICACION p
                JOIN PERSONA per ON p.id_persona = per.id_persona
                ORDER BY p.fecha DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (per_page, offset))
            posts = cursor.fetchall()
            return posts, 200
        except Exception as e:
            print(f"Error en get_all_posts: {e}")
            raise Exception("Error interno al consultar publicaciones")
        finally:
            cursor.close()
            conn.close()

    @classmethod
    def get_post_by_id(cls, id_publicacion):
        """ 
        Obtiene una publicación, su autor, sus comentarios y sus reacciones.
        Esta es una consulta más compleja.
        """
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")
        
        cursor = conn.cursor(dictionary=True)
        try:
            # 1. Obtener la publicación principal y el autor
            query_post = """
                SELECT 
                    p.id_publicacion, p.contenido, p.fecha,
                    per.id_persona, per.nombre_usuario
                FROM PUBLICACION p
                JOIN PERSONA per ON p.id_persona = per.id_persona
                WHERE p.id_publicacion = %s
            """
            cursor.execute(query_post, (id_publicacion,))
            post = cursor.fetchone()

            if not post:
                return {"error": "Publicación no encontrada"}, 404

            # 2. Obtener los comentarios
            query_comments = """
                SELECT 
                    c.id_comentario, c.contenido, c.fecha,
                    c.id_comentario_padre,
                    per.id_persona, per.nombre_usuario
                FROM COMENTARIO c
                JOIN PERSONA per ON c.id_persona = per.id_persona
                WHERE c.id_publicacion = %s
                ORDER BY c.fecha ASC
            """
            cursor.execute(query_comments, (id_publicacion,))
            post['comentarios'] = cursor.fetchall()

            # 3. Obtener el conteo de reacciones
            query_reactions = """
                SELECT 
                    tr.id_tipo_reaccion, 
                    tr.nombre_reaccion, 
                    COUNT(r.id_persona) AS conteo
                FROM TIPO_REACCION tr
                LEFT JOIN REACCION r ON tr.id_tipo_reaccion = r.id_tipo_reaccion AND r.id_publicacion = %s
                GROUP BY tr.id_tipo_reaccion, tr.nombre_reaccion
            """
            cursor.execute(query_reactions, (id_publicacion,))
            post['reacciones'] = cursor.fetchall()

            return post, 200

        except Exception as e:
            print(f"Error en get_post_by_id: {e}")
            raise Exception(f"Error interno al obtener detalle de la publicación: {e}")
        finally:
            cursor.close()
            conn.close()

    # =====================================================================
    #  MÉTODOS PARA COMENTARIOS
    # =====================================================================
    @classmethod
    def create_comment(cls, id_persona, id_publicacion, contenido, id_comentario_padre=None):
        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")
        cursor = conn.cursor()
        try:
            query = """
                INSERT INTO COMENTARIO (contenido, fecha, id_publicacion, id_persona, id_comentario_padre)
                VALUES (%s, %s, %s, %s, %s)
            """
            fecha_ahora = datetime.utcnow()
            cursor.execute(query, (contenido, fecha_ahora, id_publicacion, id_persona, id_comentario_padre))
            new_comment_id = cursor.lastrowid
            conn.commit()
            return {"message": "Comentario creado", "id_comentario": new_comment_id}, 201
        
        except mysql.connector.Error as err:
            conn.rollback()
            if err.errno == 1452: # Error de Foreign Key
                return {"error": "La publicación o el comentario padre no existe"}, 404
            print(f"Error en create_comment: {err}")
            raise Exception(f"Error interno al crear comentario: {err}")
        finally:
            cursor.close()
            conn.close()

    # =====================================================================
    #  MÉTODOS PARA REACCIONES
    # =====================================================================
    @classmethod
    def set_reaction(cls, id_persona, id_publicacion, id_tipo_reaccion):
        """
        Crea o actualiza una reacción (Upsert).
        Un usuario solo puede tener una reacción por publicación.
        """
        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")
        cursor = conn.cursor()
        try:
            # INSERT ... ON DUPLICATE KEY UPDATE
            # Intenta insertar. Si la llave (id_publicacion, id_persona) ya existe,
            # actualiza el id_tipo_reaccion.
            query = """
                INSERT INTO REACCION (id_publicacion, id_persona, id_tipo_reaccion)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    id_tipo_reaccion = %s
            """
            cursor.execute(query, (id_publicacion, id_persona, id_tipo_reaccion, id_tipo_reaccion))
            conn.commit()
            
            # rowcount 1 = insertado, rowcount 2 = actualizado
            if cursor.rowcount == 1:
                return {"message": "Reacción creada"}, 201
            elif cursor.rowcount == 2:
                return {"message": "Reacción actualizada"}, 200
            else:
                return {"message": "Reacción sin cambios"}, 200

        except mysql.connector.Error as err:
            conn.rollback()
            if err.errno == 1452: # Error de Foreign Key
                return {"error": "La publicación o el tipo de reacción no existe"}, 404
            print(f"Error en set_reaction: {err}")
            raise Exception(f"Error interno al reaccionar: {err}")
        finally:
            cursor.close()
            conn.close()
            
    @classmethod
    def remove_reaction(cls, id_persona, id_publicacion):
        """ Elimina una reacción (ej. quitar el 'like') """
        conn = get_db_connection()
        if conn is None: raise Exception("No se pudo conectar")
        cursor = conn.cursor()
        try:
            query = "DELETE FROM REACCION WHERE id_publicacion = %s AND id_persona = %s"
            cursor.execute(query, (id_publicacion, id_persona))
            conn.commit()
            
            if cursor.rowcount == 0:
                return {"error": "Reacción no encontrada para eliminar"}, 404
            
            return {"message": "Reacción eliminada"}, 200

        except Exception as e:
            conn.rollback()
            print(f"Error en remove_reaction: {e}")
            raise Exception("Error interno al eliminar reacción")
        finally:
            cursor.close()
            conn.close()