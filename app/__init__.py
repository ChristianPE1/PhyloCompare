from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)  # Permitir solicitudes desde React
    
    app.config['UPLOAD_FOLDER'] = 'app/uploads'
    app.config['RESULTS_FOLDER'] = 'app/results'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    app.secret_key = 'clave-secreta-123'
    
    # Crear directorios necesarios
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)

    from app.routes import main
    app.register_blueprint(main)

    return app
