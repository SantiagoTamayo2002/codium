'''
Credenciales que nos permiten la autenticación con Google OAuth
estas las vamos a cambiar cuando la despleguemos en producción
'''

class Config:
    SECRET_KEY = "clave-super-secreta"
    GOOGLE_CLIENT_ID = "1051530304215-bvj41286m857noa9bhuuuj6cjqopdpc3.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET = "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"
    USERS_FILE = "users.json"
