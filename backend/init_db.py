import os
from app import create_app, db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.quiz_attempt import QuizAttempt
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def init_db():
    app = create_app()
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Check if we already have users
        if User.query.count() > 0:
            print("Database already initialized. Skipping...")
            return
        
        # Create a demo user
        demo_user = User(
            username="demo_user",
            email="demo@example.com",
            password_hash=generate_password_hash("password123"),
            tokens=10,
            created_at=datetime.utcnow() - timedelta(days=30)
        )
        
        # Create an admin user
        admin_user = User(
            username="admin",
            email="admin@example.com",
            password_hash=generate_password_hash("admin123"),
            tokens=1000,
            role="admin",
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        
        # Create some sample transactions
        transaction1 = Transaction(
            user_id=1,  # Will be assigned to demo_user
            amount=99,
            tokens_purchased=10,
            payment_status="completed",
            transaction_date=datetime.utcnow() - timedelta(days=25),
            razorpay_order_id="order_demo1",
            razorpay_payment_id="pay_demo1",
            razorpay_signature="sig_demo1"
        )
        
        transaction2 = Transaction(
            user_id=1,  # Will be assigned to demo_user
            amount=199,
            tokens_purchased=25,
            payment_status="completed",
            transaction_date=datetime.utcnow() - timedelta(days=15),
            razorpay_order_id="order_demo2",
            razorpay_payment_id="pay_demo2",
            razorpay_signature="sig_demo2"
        )
        
        # Create some sample quiz attempts
        attempt1 = QuizAttempt(
            user_id=1,  # Will be assigned to demo_user
            subject="subject1",
            quiz_name="quiz1",
            score=4,
            total_questions=5,
            attempt_date=datetime.utcnow() - timedelta(days=20)
        )
        
        attempt2 = QuizAttempt(
            user_id=1,  # Will be assigned to demo_user
            subject="subject2",
            quiz_name="quiz1",
            score=3,
            total_questions=5,
            attempt_date=datetime.utcnow() - timedelta(days=10)
        )
        
        # Add to session and commit
        db.session.add(demo_user)
        db.session.add(admin_user)
        db.session.commit()  # Commit to get the user ID
        
        db.session.add_all([transaction1, transaction2, attempt1, attempt2])
        db.session.commit()
        
        print("Database initialized with sample data!")
        print("Demo user created:")
        print("  Username: demo_user")
        print("  Email: demo@example.com")
        print("  Password: password123")
        print("\nAdmin user created:")
        print("  Username: admin")
        print("  Email: admin@example.com")
        print("  Password: admin123")

if __name__ == "__main__":
    init_db() 