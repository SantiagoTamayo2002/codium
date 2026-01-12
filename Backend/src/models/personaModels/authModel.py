import mysql.connector
from ...database.db import get_db_connection
from werkzeug.security import generate_password_hash

class authModel:

    @classmethod
    def get_credentials(cls, correo):
        conn = get_db_connection()
        if conn is None:
            return None

        cursor = conn.cursor(dictionary=True)
        try:
            query = """
                SELECT id_persona, contraseña_hash, id_rol
                FROM persona
                WHERE correo = %s AND esta_activo = TRUE
            """
            cursor.execute(query, (correo,))
            return cursor.fetchone()
        except Exception as e:
            print(f"Error en get_credentials: {e}")
            return None
        finally:
            cursor.close()
            conn.close()


    @classmethod
    def get_person_by_email(cls, correo):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT id_persona, nombre, apellidos, correo, nombre_usuario, id_rol
            FROM persona
            WHERE correo = %s AND esta_activo = TRUE
        """
        cursor.execute(query, (correo,))
        person = cursor.fetchone()

        cursor.close()
        conn.close()
        return person


    @classmethod
    def create_person(
        cls, nombre, apellidos, correo,
        contrasena_plana, nombre_usuario,
        token_refresco=None, id_rol=2
    ):
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            password_hash = generate_password_hash(contrasena_plana)

            query = """
                INSERT INTO persona
                (nombre, apellidos, correo, contraseña_hash, nombre_usuario, token_refresco, id_rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                nombre, apellidos, correo,
                password_hash, nombre_usuario,
                token_refresco, id_rol
            ))

            conn.commit()
            return {
                "message": "Persona creada exitosamente",
                "id_persona": cursor.lastrowid
            }, 201

        except mysql.connector.IntegrityError as e:
            if e.errno == 1062:
                return {"error": "Correo o usuario ya existe"}, 409
            raise e

        finally:
            cursor.close()
            conn.close()
