from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def patch_db():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            print("Checking for missing columns...")
            
            # Add columns if they don't exist
            conn.execute(text("ALTER TABLE database_connections ADD COLUMN IF NOT EXISTS first_name_column VARCHAR"))
            conn.execute(text("ALTER TABLE database_connections ADD COLUMN IF NOT EXISTS last_name_column VARCHAR"))
            conn.execute(text("ALTER TABLE database_connections ADD COLUMN IF NOT EXISTS connection_url VARCHAR"))
            conn.commit()
            
        print("Database patched successfully!")
    except Exception as e:
        print(f"Error patching database: {e}")

if __name__ == "__main__":
    patch_db()
