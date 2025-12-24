# from flask import Flask, send_from_directory, jsonify
# from flask_sqlalchemy import SQLAlchemy
# from flask_cors import CORS
# import os

# db = SQLAlchemy()

# def create_app():
#     app = Flask(__name__)
#     CORS(app, supports_credentials=True)

#     app.config["SECRET_KEY"] = "your-secret-key"
#     app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost/pet_monitoring_db"
#     app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#     app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
#         "pool_recycle": 280,
#         "pool_pre_ping": True
#     }

#     # Upload folder config
#     app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "uploads/pets_data")
#     os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

#     db.init_app(app)

#     # Import and register routes
#     from app.routes.user import user_bp
#     app.register_blueprint(user_bp)

#     from app.routes.pets_routes import pet_bp
#     app.register_blueprint(pet_bp, url_prefix="/api/pets")  
#     # # ✅ Pet APIs will now be:
#     # GET    /api/pets/
#     # POST   /api/pets/add
#     # DELETE /api/pets/<id>

#     # Serve uploaded pet images
#     @app.route("/uploads/pets_data/<filename>")
#     def uploaded_file(filename):
#         return send_from_directory(app.config["UPLOAD_FOLDER"], filename)
  
#     return app


from flask import Flask, send_from_directory,current_app , jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    app.config["SECRET_KEY"] = "your-secret-key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost/pet_monitoring_db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 280,
        "pool_pre_ping": True
    }

    # ✅ Pets upload folder config
    app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "uploads/pets_data")
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Serve pet images
    @app.route('/uploads/pets_data/<path:filename>')
    def serve_pet_image(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    db.init_app(app)

    # Import and register routes
    from app.routes.user import user_bp
    app.register_blueprint(user_bp)

    from app.routes.pets_routes import pet_bp
    app.register_blueprint(pet_bp, url_prefix="/api/pets")  

 # ✅ Veterinarian uploads
    app.config["UPLOAD_FOLDER_VETS"] = os.path.join(app.root_path, "uploads/vets")
    os.makedirs(app.config["UPLOAD_FOLDER_VETS"], exist_ok=True)

    from app.routes.veteri_routes import veteri_bp
    app.register_blueprint(veteri_bp, url_prefix="/api/veterinarians")

    @app.route("/uploads/vets/<filename>")
    def uploaded_vet_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER_VETS"], filename)

    return app
