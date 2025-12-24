
from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from werkzeug.security import generate_password_hash
import datetime
import jwt

SECRET_KEY = "your-secret-key"

user_bp = Blueprint("user_bp", __name__, url_prefix="/api/user")

# ✅ Signup route
@user_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()  # frontend sends JSON
    if not data:
        return jsonify({"error": "No input provided"}), 400

    username = data.get("username")
    email = data.get("useremail")
    password = data.get("userpassword")
    gender = data.get("gender")
    user_type = data.get("userType")

    if not username or not email or not password or not user_type:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if email exists
    if User.query.filter_by(useremail=email).first():
        return jsonify({"error": "Email already exists"}), 400

    # Create new user
    new_user = User(
        username=username,
        useremail=email,
        gender=gender,
        user_type=user_type
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


# ✅ Login route
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("useremail")
    password = data.get("userpassword")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(useremail=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": user.id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({
        "user_id": user.id,
        "message": "Login successful",
        "username": user.username,
        "useremail": user.useremail,
        "gender": user.gender,
        "user_type": user.user_type,
        "token": token
    }), 200
