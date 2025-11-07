import mysql.connector


DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'app_user',
    'password': 'S@ntiagoñ2002',
    'database': 'codium_db',
     'port': 3306
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Error al conectar a MySQL: {err}")
        return None