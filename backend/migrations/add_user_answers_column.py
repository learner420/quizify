"""
Migration script to add user_answers column to the quiz_attempts table.
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
    """Run the migration to add user_answers column to the quiz_attempts table"""
    app = create_app()
    
    with app.app_context():
        # Check if the column already exists
        from app.models.quiz_attempt import QuizAttempt
        
        # Get the table name
        table_name = QuizAttempt.__tablename__
        
        # Check if the column exists
        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        
        # Add the column if it doesn't exist
        if 'user_answers' not in columns:
            print("Adding user_answers column to quiz_attempts table...")
            db.session.execute(text(f'ALTER TABLE {table_name} ADD COLUMN user_answers TEXT NULL'))
            db.session.commit()
            print("Column added successfully!")
        else:
            print("user_answers column already exists")
            
        print("Migration completed successfully!")

if __name__ == '__main__':
    run_migration() 