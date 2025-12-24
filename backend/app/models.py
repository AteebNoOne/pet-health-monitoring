from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False)
    useremail = db.Column(db.String(150), unique=True, nullable=False)
    userpassword = db.Column(db.String(200), nullable=False)
    gender = db.Column(db.String(10))
    user_type = db.Column(db.String(20), nullable=False, default="pet_owner")  # new field

    def set_password(self, password):
        self.userpassword = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    def check_password(self, password):
        return check_password_hash(self.userpassword, password)

from app import db

class Pet(db.Model):
    __tablename__ = "pets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False) 
    pet_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.String(50))
    weight = db.Column(db.String(50))
    gender = db.Column(db.String(20))
    breed = db.Column(db.String(100))
    pet_type = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    device_mac_id = db.Column(db.String(50)) # BLE MAC Address

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "pet_name": self.pet_name,
            "age": self.age,
            "weight": self.weight,
            "gender": self.gender,
            "breed": self.breed,
            "pet_type": self.pet_type,
            "image_url": self.image_url,
            "device_mac_id": self.device_mac_id,
        }
    

#model for Veterinarian
from app import db

class Veterinarian(db.Model):
    __tablename__ = "veterinarians"

    id = db.Column("veteri_id", db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column("veteri_name", db.String(100), nullable=False)
    address = db.Column("veteri_address", db.String(200))
    email = db.Column("veteri_email", db.String(120), unique=True, nullable=False)
    phone = db.Column("veteri_phonenumber", db.String(20))
    education = db.Column("veteri_education", db.String(200))
    description = db.Column("veteri_decription", db.Text)
    image_url = db.Column("veteri_image", db.String(255))
    
    # ✅ New fields
    specialist = db.Column("veteri_specialist", db.String(100))
    gender = db.Column("veteri_gender", db.Enum("Male", "Female", "Other", name="veteri_gender_enum"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "address": self.address,
            "email": self.email,
            "phone": self.phone,
            "education": self.education,
            "description": self.description,
            "image_url": self.image_url,
            "specialist": self.specialist,
            "gender": self.gender,
        }

