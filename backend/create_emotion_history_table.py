"""
Script to create the cat_emotion_history table in the database
Run this once to add the new table
"""

from app import create_app, db
from app.models import CatEmotionHistory

app = create_app()

with app.app_context():
    # Create the table
    db.create_all()
    print("✅ cat_emotion_history table created successfully!")
