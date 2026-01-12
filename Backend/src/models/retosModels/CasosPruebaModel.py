from db import get_connection

class CasosPruebaModel:

    @staticmethod
    def get_casos_by_reto(id_reto):
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id_caso, entrada, salida_esperada
            FROM caso_prueba
            WHERE id_reto = %s AND visible = 1
        """, (id_reto,))

        casos = cursor.fetchall()
        conn.close()
        return casos
