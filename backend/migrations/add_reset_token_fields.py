"""
Migration script to add reset token fields to the User model.
Run this script to update the database schema.
"""
import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from sqlalchemy import text

def run_migration():
    """Run the migration to add reset token fields to the User model"""
    app = create_app()
    
    with app.app_context():
        # Check if the columns already exist
        from app.models.user import User
        
        # Get the table name
        table_name = User.__tablename__
        
        # Check if the columns exist
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        
        # Add the columns if they don't exist
        if 'reset_token' not in columns:
            print("Adding reset_token column to users table...")
            db.session.execute(text(f'ALTER TABLE {table_name} ADD COLUMN reset_token VARCHAR(100) UNIQUE NULL'))
        else:
            print("reset_token column already exists")
            
        if 'reset_token_expiry' not in columns:
            print("Adding reset_token_expiry column to users table...")
            db.session.execute(text(f'ALTER TABLE {table_name} ADD COLUMN reset_token_expiry TIMESTAMP NULL'))
        else:
            print("reset_token_expiry column already exists")
            
        db.session.commit()
        print("Migration completed successfully!")

if __name__ == '__main__':
    run_migration() 