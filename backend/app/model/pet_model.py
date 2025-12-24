# from app import db

# class Pet(db.Model):
#     __tablename__ = "pets"

#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # link to user
#     pet_name = db.Column(db.String(100), nullable=False)
#     age = db.Column(db.String(50))
#     weight = db.Column(db.String(50))
#     gender = db.Column(db.String(20))
#     breed = db.Column(db.String(100))
#     pet_type = db.Column(db.String(50))
#     image_url = db.Column(db.String(255))  # path to uploaded image

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "user_id": self.user_id,
#             "name": self.pet_name,
#             "age": self.age,
#             "weight": self.weight,
#             "gender": self.gender,
#             "breed": self.breed,
#             "petType": self.pet_type,
#             "image": self.image_url,
#         }
