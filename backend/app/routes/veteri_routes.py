# from flask import Blueprint, request, jsonify, current_app
# from app import db
# from app.models import Veterinarian, User
# from werkzeug.utils import secure_filename
# import os, uuid, traceback

# veteri_bp = Blueprint("veterinarians", __name__)

# ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# def allowed_file(filename):
#     return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# @veteri_bp.route("/", methods=["GET"])
# def get_veterinarians():
#     try:
#         user_type = request.args.get("user_type")
#         user_id = request.args.get("user_id")

#         if user_type == "veterinarian":
#             if not user_id:
#                 return jsonify({"error": "user_id is required for veterinarians"}), 400
#             vets = Veterinarian.query.filter_by(user_id=user_id).all()
#         else:
#             vets = Veterinarian.query.all()

#         vets_list = []
#         for vet in vets:
#             vets_list.append({
#                 "id": vet.id,
#                 "name": vet.name,
#                 "address": vet.address,
#                 "email": vet.email,
#                 "phone": vet.phone,
#                 "education": vet.education,
#                 "description": vet.description,
#                 "image_url": f"http://192.168.1.2:5000/uploads/vets/{vet.image_url}" if vet.image_url else None,
#                 "user_id": vet.user_id,
#                 "specialist": vet.specialist,
#                 "gender": vet.gender,
#             })

#         return jsonify(vets_list), 200

#     except Exception as e:
#         print("❌ Error fetching veterinarians:", e)
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


# # ✅ Add veterinarian (and return updated vets list using same filtering logic)
# @veteri_bp.route("/add", methods=["POST"])
# def add_veterinarian():
#     try:
#         data = request.form.to_dict()
#         file = request.files.get("image")

#         filename = None
#         if file and allowed_file(file.filename):
#             ext = file.filename.rsplit(".", 1)[1].lower()
#             filename = f"{uuid.uuid4().hex}.{ext}"
#             upload_path = os.path.join(current_app.config["UPLOAD_FOLDER_VETS"], filename)  # ✅ Save in vets folder
#             file.save(upload_path)

#             # ✅ Force saving inside uploads/vets/
#             vets_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "vets")
#             os.makedirs(vets_folder, exist_ok=True)

#             upload_path = os.path.join(vets_folder, filename)
#             file.save(upload_path)



#         new_vet = Veterinarian(
#             user_id=data.get("user_id"),
#             name=data.get("name"),
#             address=data.get("address"),
#             email=data.get("email"),
#             phone=data.get("phone"),
#             education=data.get("education"),
#             description=data.get("description"),
#             image_url=filename,
#             specialist=data.get("specialist"),
#             gender=data.get("gender")
#         )

#         db.session.add(new_vet)
#         db.session.commit()

#         # ✅ After adding, return filtered vets list
#         user_type = data.get("user_type")   # 👈 coming from frontend form
#         user_id = data.get("user_id")

#         if user_type == "veterinarian":
#             if not user_id:
#                 return jsonify({"error": "user_id is required for veterinarians"}), 400
#             vets = Veterinarian.query.filter_by(user_id=user_id).all()
#         else:
#             vets = Veterinarian.query.all()

#         vets_list = []
#         for vet in vets:
#             vets_list.append({
#                 "id": vet.id,
#                 "name": vet.name,
#                 "address": vet.address,
#                 "email": vet.email,
#                 "phone": vet.phone,
#                 "education": vet.education,
#                 "description": vet.description,
#                 "image_url": f"http://192.168.1.2:5000/uploads/vets/{vet.image_url}" if vet.image_url else None,
#                 "user_id": vet.user_id,
#                 "specialist": vet.specialist,
#                 "gender": vet.gender,
#             })

#         return jsonify({
#             "message": "Veterinarian added successfully!",
#             "veterinarians": vets_list
#         }), 201

#     except Exception as e:
#         db.session.rollback()
#         print("❌ Error adding vet:", e)
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


# # route for deleting a veterinarian
# @veteri_bp.route("/delete/<int:vet_id>", methods=["DELETE"])
# def delete_veterinarian(vet_id):
#     try:
#         vet = Veterinarian.query.get(vet_id)
#         if not vet:
#             return jsonify({"error": "Veterinarian not found"}), 404
#         db.session.delete(vet)
#         db.session.commit()
#         return jsonify({"message": "Veterinarian deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500


# # ✅ Get single veterinarian by ID
# @veteri_bp.route("/<int:vet_id>", methods=["GET"])
# def get_veterinarian(vet_id):
#     try:
#         vet = Veterinarian.query.get(vet_id)
#         if not vet:
#             return jsonify({"error": "Veterinarian not found"}), 404

#         vet_data = {
#             "id": vet.id,
#             "name": vet.name,
#             "address": vet.address,
#             "email": vet.email,
#             "phone": vet.phone,
#             "education": vet.education,
#             "description": vet.description,
#             "image_url": f"http://192.168.1.2:5000/uploads/vets/{vet.image_url}" if vet.image_url else None,
#             "user_id": vet.user_id,
#             "specialist": vet.specialist,
#             "gender": vet.gender,
#         }
#         return jsonify(vet_data), 200
#     except Exception as e:
#         print("❌ Error fetching veterinarian:", e)
#         return jsonify({"error": str(e)}), 500

# # ✅ Update veterinarian by ID
# @veteri_bp.route("/<int:vet_id>", methods=["PUT"])
# def update_veterinarian(vet_id):
#     try:
#         vet = Veterinarian.query.get(vet_id)
#         if not vet:
#             return jsonify({"error": "Veterinarian not found"}), 404

#         data = request.form.to_dict()
#         file = request.files.get("image_file")

#         # Update basic fields
#         vet.name = data.get("name", vet.name)
#         vet.phone = data.get("phone", vet.phone)
#         vet.address = data.get("address", vet.address)
#         vet.email = data.get("email", vet.email)
#         vet.education = data.get("education", vet.education)
#         vet.description = data.get("description", vet.description)
#         vet.specialist = data.get("specialist", vet.specialist)
#         vet.gender = data.get("gender", vet.gender)

#         # Handle image upload (if new one provided)
#         if file and allowed_file(file.filename):
#             ext = file.filename.rsplit(".", 1)[1].lower()
#             filename = f"{uuid.uuid4().hex}.{ext}"
#             vets_folder = os.path.join(current_app.config["UPLOAD_FOLDER"], "vets")
#             os.makedirs(vets_folder, exist_ok=True)
#             upload_path = os.path.join(vets_folder, filename)
#             file.save(upload_path)
#             vet.image_url = filename

#         db.session.commit()

#         return jsonify({"message": "Veterinarian updated successfully!"}), 200

#     except Exception as e:
#         db.session.rollback()
#         print("❌ Error updating veterinarian:", e)
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Veterinarian

veteri_bp = Blueprint("veterinarians", __name__)

# Allowed image extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ✅ Route: Add new veterinarian
@veteri_bp.route("/add", methods=["POST"])
def add_veterinarian():
    try:
        user_id = request.form.get("user_id")
        name = request.form.get("name")
        address = request.form.get("address")
        email = request.form.get("email")
        phone = request.form.get("phone")
        education = request.form.get("education")
        description = request.form.get("description")
        specialist = request.form.get("specialist")
        gender = request.form.get("gender")

        image_file = request.files.get("image_file")
        image_filename = None

        if image_file and allowed_file(image_file.filename):
            ext = os.path.splitext(image_file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            filename = secure_filename(unique_filename)

            upload_folder = current_app.config["UPLOAD_FOLDER_VETS"]
            os.makedirs(upload_folder, exist_ok=True)

            image_path = os.path.join(upload_folder, filename)
            image_file.save(image_path)
            image_filename = filename

        new_vet = Veterinarian(
            user_id=user_id,
            name=name,
            address=address,
            email=email,
            phone=phone,
            education=education,
            description=description,
            image_url=image_filename,
            specialist=specialist,
            gender=gender,
        )

        db.session.add(new_vet)
        db.session.commit()

        return jsonify({"message": "Veterinarian added successfully!"}), 201

    except Exception as e:
        print("Error adding veterinarian:", e)
        return jsonify({"error": str(e)}), 500


# ✅ Route: Fetch all veterinarians (optionally filter by user_id)
@veteri_bp.route("/", methods=["GET"])
def get_veterinarians():
    try:
        user_id = request.args.get("user_id")
        user_type = request.args.get("user_type")  # 👈 Added this line

        # ✅ Pet owners and admins see all veterinarians
        if user_type in ["pet_owner", "admin"]:
            vets = Veterinarian.query.all()
        else:
            # ✅ Veterinarian sees only their own profile
            vets = Veterinarian.query.filter_by(user_id=user_id).all()

        vets_list = []
        for vet in vets:
            image_url = f"{request.host_url}uploads/vets/{vet.image_url}" if vet.image_url else None
            vets_list.append({
                "id": vet.id,
                "name": vet.name,
                "address": vet.address,
                "email": vet.email,
                "phone": vet.phone,
                "education": vet.education,
                "description": vet.description,
                "specialist": vet.specialist,
                "gender": vet.gender,
                "user_id": vet.user_id,
                "image_url": image_url,
            })

        return jsonify(vets_list), 200

    except Exception as e:
        print("❌ Error fetching veterinarians:", e)
        return jsonify({"error": str(e)}), 500

# ✅ Route: Get veterinarian by ID
@veteri_bp.route("/<int:vet_id>", methods=["GET"])
def get_veterinarian_by_id(vet_id):
    vet = Veterinarian.query.get(vet_id)

    if not vet:
        return jsonify({"error": f"Veterinarian with id {vet_id} not found"}), 404

    if vet.image_url:
        image_url = f"{request.host_url}uploads/vets/{vet.image_url}"
    else:
        image_url = None

    vet_data = {
        "id": vet.id,
        "name": vet.name,
        "address": vet.address,
        "email": vet.email,
        "phone": vet.phone,
        "education": vet.education,
        "description": vet.description,
        "specialist": vet.specialist,
        "gender": vet.gender,
        "user_id": vet.user_id,
        "image_url": image_url,
    }

    return jsonify(vet_data), 200


# ✅ Route: Serve vet images
@veteri_bp.route("/uploads/vets/<filename>")
def serve_vet_image(filename):
    upload_folder = current_app.config["UPLOAD_FOLDER_VETS"]
    return send_from_directory(upload_folder, filename)


# ✅ Route: Delete veterinarian
@veteri_bp.route("/<int:vet_id>", methods=["DELETE"])
def delete_veterinarian(vet_id):
    try:
        vet = Veterinarian.query.get(vet_id)
        if not vet:
            return jsonify({"error": "Veterinarian not found"}), 404

        # delete image if exists
        if vet.image_url:
            upload_folder = current_app.config["UPLOAD_FOLDER_VETS"]
            image_path = os.path.join(upload_folder, vet.image_url)
            if os.path.exists(image_path):
                os.remove(image_path)

        db.session.delete(vet)
        db.session.commit()

        return jsonify({"message": "Veterinarian deleted successfully!"}), 200

    except Exception as e:
        print("❌ Error deleting veterinarian:", e)
        return jsonify({"error": str(e)}), 500


# ✅ Route: Update veterinarian
@veteri_bp.route("/<int:vet_id>", methods=["PUT"])
def update_veterinarian(vet_id):
    try:
        vet = Veterinarian.query.get(vet_id)
        if not vet:
            return jsonify({"error": "Veterinarian not found"}), 404

        vet.name = request.form.get("name", vet.name)
        vet.address = request.form.get("address", vet.address)
        vet.email = request.form.get("email", vet.email)
        vet.phone = request.form.get("phone", vet.phone)
        vet.education = request.form.get("education", vet.education)
        vet.description = request.form.get("description", vet.description)
        vet.specialist = request.form.get("specialist", vet.specialist)
        vet.gender = request.form.get("gender", vet.gender)

        image_file = request.files.get("image_file")
        if image_file and allowed_file(image_file.filename):
            ext = os.path.splitext(image_file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            filename = secure_filename(unique_filename)

            upload_folder = current_app.config["UPLOAD_FOLDER_VETS"]
            os.makedirs(upload_folder, exist_ok=True)
            image_path = os.path.join(upload_folder, filename)
            image_file.save(image_path)

            # delete old image
            if vet.image_url:
                old_path = os.path.join(upload_folder, vet.image_url)
                if os.path.exists(old_path):
                    os.remove(old_path)

            vet.image_url = filename

        db.session.commit()
        return jsonify({"message": "Veterinarian updated successfully!"}), 200

    except Exception as e:
        print("❌ Error updating veterinarian:", e)
        return jsonify({"error": str(e)}), 500
