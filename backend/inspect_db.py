import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import create_engine, inspect
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

columns = inspector.get_columns('sim_cards')
print("Columns in sim_cards table:")
for column in columns:
    print(f"- {column['name']} ({column['type']})")
