from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from flask import send_from_directory
import os

# Change imports to use relative imports
from .api.routes import api
from .api.models import db, User

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'terraria.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Add error handlers
@app.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return jsonify({'error': error.description}), error.code
    return jsonify({'error': str(error)}), 500

# Updated CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:8000", "http://127.0.0.1:8000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "send_wildcard": False
    }
})

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'api.login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register blueprints
app.register_blueprint(api)

with app.app_context():
    db.create_all()

@app.route('/terraria.db')
def serve_db():
    return send_from_directory(os.path.dirname(__file__), 'terraria.db')

if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Specify the port explicitly