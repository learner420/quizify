from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    tokens_purchased = db.Column(db.Integer, nullable=False)
    payment_status = db.Column(db.String(50), nullable=False)
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)
    razorpay_order_id = db.Column(db.String(255), nullable=True)
    razorpay_payment_id = db.Column(db.String(255), nullable=True)
    razorpay_signature = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return f'<Transaction {self.id} - User {self.user_id} - Amount {self.amount}>' 