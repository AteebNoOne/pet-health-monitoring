from app import create_app, db
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as connection:
            # Check if column exists first to avoid error if re-ran
            result = connection.execute(text("SHOW COLUMNS FROM pets LIKE 'device_mac_id'"))
            if result.fetchone():
                print("Column device_mac_id already exists.")
            else:
                connection.execute(text("ALTER TABLE pets ADD COLUMN device_mac_id VARCHAR(50)"))
                print("Successfully added device_mac_id column.")
    except Exception as e:
        print(f"Error updating database: {e}")
