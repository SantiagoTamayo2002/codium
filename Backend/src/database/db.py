import mysql.connector

DB_CONFIG = {
    'host': 'localhost',
    'user': 'app_user',
    'password': 'CodiumApp2025@',
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

# ---------------------------
# Aquí empieza tu "script principal"
# ---------------------------
conn = get_db_connection()
if conn:
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES;")  # Esto lista todas las tablas de codium_db
    for table in cursor:
        print(table)
    conn.close()
