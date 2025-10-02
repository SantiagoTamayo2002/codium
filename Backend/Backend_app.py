from flask import Flask
from flask_cors import CORS


app = Flask(__name__)
# modificar en producción especificando los orígenes permitidos
CORS(app) # Habilitar CORS para todas las rutas y orígenes
@app.route("/")
def hello():
    return "Inicio de la aplicación Backend en modo de pruebas con Flask!"

if __name__ == "__main__":
    #app.run(debug=True) Para cerrar la entrada al server de dispositivos externos 
    app.run(host="0.0.0.0", port=5000, debug=True)

