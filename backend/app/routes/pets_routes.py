import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Pet

pet_bp = Blueprint("pets", __name__)

# Allowed extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ✅ Route: Add new pet
@pet_bp.route('/add', methods=['POST'])
def add_pet():
    try:
        user_id = request.form.get("user_id")
        pet_name = request.form.get("pet_name")
        age = request.form.get("age")
        weight = request.form.get("weight")
        gender = request.form.get("gender")
        breed = request.form.get("breed")
        pet_type = request.form.get("pet_type")
        device_mac_id = request.form.get("device_mac_id")

        image_file = request.files.get("image_file")
        image_filename = None

        if image_file and allowed_file(image_file.filename):
            ext = os.path.splitext(image_file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"    
            filename = secure_filename(unique_filename)

            upload_folder = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_folder, exist_ok=True)

            image_path = os.path.join(upload_folder, filename)
            image_file.save(image_path)
            image_filename = filename  # store only filename in DB

        new_pet = Pet(
            user_id=user_id,
            pet_name=pet_name,
            age=age,
            weight=weight,
            gender=gender,
            breed=breed,
            pet_type=pet_type,
            image_url=image_filename,
            device_mac_id=device_mac_id
        )

        db.session.add(new_pet)
        db.session.commit()

        return jsonify({"message": "Pet added successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ✅ Route: Fetch all pets
@pet_bp.route("/", methods=["GET"])
def get_pets():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    pets = Pet.query.filter_by(user_id=user_id).all()
    pet_list = []

    for pet in pets:
        if pet.image_url:
            image_url = f"{request.host_url}uploads/pets_data/{pet.image_url}"
        else:
            image_url = None
        
        pet_list.append({
            "id": pet.id,
            "pet_name": pet.pet_name,
            "age": pet.age,
            "weight": pet.weight,
            "gender": pet.gender,
            "breed": pet.breed,
            "pet_type": pet.pet_type,
            "image_url": image_url,
            "device_mac_id": pet.device_mac_id,
        })

    return jsonify(pet_list)

@pet_bp.route("/<int:pet_id>", methods=["GET"])
def get_pet_by_id(pet_id):
    pet = Pet.query.get(pet_id)

    if not pet:
        return jsonify({"error": f"Pet with id {pet_id} not found"}), 404


    if pet.image_url:
        image_url = f"http://{request.host}/uploads/pets_data/{pet.image_url}"

    else:
        image_url = None

    pet_data = {
        "id": pet.id,
        "pet_name": pet.pet_name,
        "age": pet.age,
        "weight": pet.weight,
        "gender": pet.gender,
        "breed": pet.breed,
        "pet_type": pet.pet_type,
        "image_url": image_url,
        "device_mac_id": pet.device_mac_id,
    }

    return jsonify(pet_data)


# ✅ Route: Serve pet images
@pet_bp.route("/uploads/pets_data/<filename>")
def uploaded_file(filename):
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_folder, filename)

# ✅ Route: Delete a pet
@pet_bp.route("/<int:pet_id>", methods=["DELETE"])
def delete_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({"error": "Pet not found"}), 404

        # delete image file if exists
        if pet.image_url:
            upload_folder = current_app.config["UPLOAD_FOLDER"]
            image_path = os.path.join(upload_folder, pet.image_url)
            if os.path.exists(image_path):
                os.remove(image_path)

        db.session.delete(pet)
        db.session.commit()

        return jsonify({"message": "Pet deleted successfully"}), 200

    except Exception as e:
        print("Error while deleting pet:", e)
        return jsonify({"error": str(e)}), 500
    
# Route for update pet
@pet_bp.route("/<int:pet_id>", methods=["PUT"])
def update_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)
        if not pet:
            return jsonify({"error": "Pet not found"}), 404

        pet.pet_name = request.form.get("pet_name", pet.pet_name)
        pet.age = request.form.get("age", pet.age)
        pet.weight = request.form.get("weight", pet.weight)
        pet.gender = request.form.get("gender", pet.gender)
        pet.breed = request.form.get("breed", pet.breed)
        pet.pet_type = request.form.get("pet_type", pet.pet_type)
        pet.device_mac_id = request.form.get("device_mac_id", pet.device_mac_id)

        image_file = request.files.get("image_file")
        if image_file and allowed_file(image_file.filename):
            ext = os.path.splitext(image_file.filename)[1]
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            filename = secure_filename(unique_filename)
            upload_folder = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_folder, exist_ok=True)
            image_path = os.path.join(upload_folder, filename)
            image_file.save(image_path)

            # delete old image
            if pet.image_url:
                old_path = os.path.join(upload_folder, pet.image_url)
                if os.path.exists(old_path):
                    os.remove(old_path)

            pet.image_url = filename

        db.session.commit()
        return jsonify({"message": "Pet updated successfully!"}), 200

    except Exception as e:
        print("❌ Error updating pet:", e)
        return jsonify({"error": str(e)}), 500
    
    # update route complete
