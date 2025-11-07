# Backend/src/models/retosModel.py
import mysql
from ...database.db import get_db_connection
from datetime import datetime

class RetosModel:

    @classmethod
    def create_reto(cls, reto_data):
        """
        Crea un nuevo reto, sus lenguajes asociados y sus casos de prueba
        dentro de una transacción de base de datos.
        """
        conn = get_db_connection()
        if conn is None:
            raise Exception("No se pudo conectar a la base de datos")
        
        cursor = conn.cursor(dictionary=True)

        try:
            # 1. Iniciar transacción
            conn.start_transaction()

            # 2. Obtener el id_dificultad
            query_dificultad = "SELECT id_dificultad FROM DIFICULTAD WHERE nombre_dificultad = %s"
            cursor.execute(query_dificultad, (reto_data['nombre_dificultad'],))
            dificultad = cursor.fetchone()
            
            if not dificultad:
                conn.rollback() 
                return {"error": f"Dificultad '{reto_data['nombre_dificultad']}' no encontrada"}, 400
            
            id_dificultad = dificultad['id_dificultad']

            # 3. Insertar en RETO
            query_reto = """
                INSERT INTO RETO (titulo, descripcion, fecha_publicacion, limite_tiempo_segundos, id_dificultad)
                VALUES (%s, %s, %s, %s, %s)
            """
            fecha_ahora = datetime.utcnow()
            cursor.execute(query_reto, (
                reto_data['titulo'],
                reto_data['descripcion'],
                fecha_ahora,
                reto_data.get('limite_tiempo_segundos'),
                id_dificultad
            ))
            
            id_reto_nuevo = cursor.lastrowid
            if id_reto_nuevo == 0:
                 raise Exception("No se pudo obtener el ID del reto creado.")

            # 4. Insertar en RETO_LENGUAJE
            nombres_lenguajes = reto_data['lenguajes']
            if not nombres_lenguajes:
                 conn.rollback()
                 return {"error": "Se debe proporcionar al menos un lenguaje"}, 400

            format_strings = ','.join(['%s'] * len(nombres_lenguajes))
            query_lenguajes = f"SELECT id_lenguaje, nombre_lenguaje FROM LENGUAJE WHERE nombre_lenguaje IN ({format_strings})"
            cursor.execute(query_lenguajes, tuple(nombres_lenguajes))
            lenguajes_encontrados = cursor.fetchall()

            if len(lenguajes_encontrados) != len(nombres_lenguajes):
                conn.rollback()
                return {"error": "Uno o más lenguajes no son válidos"}, 400

            datos_reto_lenguaje = [(id_reto_nuevo, lang['id_lenguaje']) for lang in lenguajes_encontrados]
            query_insert_lenguajes = "INSERT INTO RETO_LENGUAJE (id_reto, id_lenguaje) VALUES (%s, %s)"
            cursor.executemany(query_insert_lenguajes, datos_reto_lenguaje)

            # 5. Insertar en TEST
            tests = reto_data['tests']
            if not tests:
                conn.rollback()
                return {"error": "Se debe proporcionar al menos un caso de prueba"}, 400

            datos_tests = []
            for test in tests:
                datos_tests.append((
                    test['datos_entrada'],
                    test['salida_esperada'],
                    test.get('es_publico', True),
                    id_reto_nuevo
                ))

            query_insert_tests = """
                INSERT INTO TEST (datos_entrada, salida_esperada, es_publico, id_reto)
                VALUES (%s, %s, %s, %s)
            """
            cursor.executemany(query_insert_tests, datos_tests)

            # 6. Commit
            conn.commit()
            
            return {"message": "Reto creado exitosamente", "id_reto": id_reto_nuevo}, 201

        except mysql.connector.Error as err:
            conn.rollback()
            print(f"Error de MySQL en create_reto: {err}")
            return {"error": f"Error de base de datos: {err.msg}"}, 500
        except Exception as e:
            conn.rollback()
            print(f"Error inesperado en create_reto: {e}")
            raise Exception(f"Error interno al crear el reto: {e}")
        finally:
            cursor.close()
            conn.close()

    # =====================================================================
    #  NUEVO MÉTODO: GET Todos los Retos (con paginación)
    # =====================================================================
    @classmethod
    def get_all_retos(cls, page=1, per_page=20):
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")
        
        cursor = conn.cursor(dictionary=True)
        try:
            offset = (page - 1) * per_page
            
            # Unimos RETO con DIFICULTAD para obtener el nombre de la dificultad
            query = """
                SELECT 
                    r.id_reto, 
                    r.titulo, 
                    r.fecha_publicacion, 
                    d.nombre_dificultad
                FROM RETO r
                JOIN DIFICULTAD d ON r.id_dificultad = d.id_dificultad
                ORDER BY r.fecha_publicacion DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, (per_page, offset))
            retos = cursor.fetchall()
            return retos
        
        except Exception as e:
            print(f"Error al ejecutar consulta en get_all_retos: {e}")
            raise Exception("Error interno al consultar retos")
        finally:
            cursor.close()
            conn.close()

    # =====================================================================
    #  NUEVO MÉTODO: GET Reto por ID (con detalles)
    # =====================================================================
    @classmethod
    def get_reto_by_id(cls, id_reto):
        conn = get_db_connection()
        if conn is None:
            raise Exception("Sin respuesta de la base de datos")

        cursor = conn.cursor(dictionary=True)
        try:
            # 1. Obtener los detalles principales del reto
            query_reto = """
                SELECT 
                    r.id_reto, 
                    r.titulo, 
                    r.descripcion, 
                    r.fecha_publicacion, 
                    r.limite_tiempo_segundos, 
                    d.nombre_dificultad
                FROM RETO r
                JOIN DIFICULTAD d ON r.id_dificultad = d.id_dificultad
                WHERE r.id_reto = %s
            """
            cursor.execute(query_reto, (id_reto,))
            reto = cursor.fetchone()

            if not reto:
                return None # Reto no encontrado

            # 2. Obtener los lenguajes permitidos
            query_lenguajes = """
                SELECT l.nombre_lenguaje, l.version
                FROM LENGUAJE l
                JOIN RETO_LENGUAJE rl ON l.id_lenguaje = rl.id_lenguaje
                WHERE rl.id_reto = %s
            """
            cursor.execute(query_lenguajes, (id_reto,))
            lenguajes = cursor.fetchall()
            reto['lenguajes_permitidos'] = lenguajes

            # 3. Obtener los casos de prueba PÚBLICOS
            query_tests = """
                SELECT datos_entrada, salida_esperada
                FROM TEST
                WHERE id_reto = %s AND es_publico = TRUE
            """
            cursor.execute(query_tests, (id_reto,))
            tests_publicos = cursor.fetchall()
            reto['casos_de_prueba'] = tests_publicos

            return reto

        except Exception as e:
            print(f"Error al ejecutar consulta en get_reto_by_id: {e}")
            raise Exception("Error interno al consultar detalle del reto")
        finally:
            cursor.close()
            conn.close()

    