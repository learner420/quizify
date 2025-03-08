import os
import razorpay
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app import db
from app.models.transaction import Transaction

payment_bp = Blueprint('payment', __name__, url_prefix='/api/payment')

# Initialize Razorpay client with error handling
try:
    razorpay_client = razorpay.Client(
        auth=(os.environ.get('RAZORPAY_KEY_ID'), os.environ.get('RAZORPAY_KEY_SECRET'))
    )
except Exception as e:
    print(f"Warning: Failed to initialize Razorpay client: {e}")
    razorpay_client = None

# Token package options
TOKEN_PACKAGES = {
    'basic': {'amount': 99, 'tokens': 10},
    'standard': {'amount': 199, 'tokens': 25},
    'premium': {'amount': 499, 'tokens': 75}
}

@payment_bp.route('/packages', methods=['GET'])
def get_packages():
    return jsonify({
        'packages': TOKEN_PACKAGES
    }), 200

@payment_bp.route('/create-order', methods=['POST'])
@login_required
def create_order():
    # Get the request data
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('package'):
        return jsonify({'error': 'Package selection is required'}), 400
    
    package_name = data.get('package')
    
    # Check if package exists
    if package_name not in TOKEN_PACKAGES:
        return jsonify({'error': 'Invalid package selected'}), 400
    
    package = TOKEN_PACKAGES[package_name]
    
    # Check if Razorpay client is initialized
    if razorpay_client is None:
        # For development/testing, simulate a successful order creation
        try:
            # Create a mock transaction for testing
            transaction = Transaction(
                user_id=current_user.id,
                amount=package['amount'],
                tokens_purchased=package['tokens'],
                payment_status='completed',  # Auto-complete for testing
                razorpay_order_id=f"order_test_{current_user.id}_{package_name}"
            )
            
            db.session.add(transaction)
            db.session.commit()
            
            # Add tokens to user account
            current_user.add_tokens(package['tokens'])
            
            return jsonify({
                'message': 'Test mode: Tokens added successfully',
                'tokens_added': package['tokens'],
                'current_tokens': current_user.tokens
            }), 200
        except Exception as e:
            return jsonify({'error': f'Test mode error: {str(e)}'}), 500
    
    # If Razorpay client is available, proceed with normal flow
    amount = package['amount'] * 100  # Convert to paise (Razorpay uses smallest currency unit)
    
    # Create Razorpay order
    try:
        order_data = {
            'amount': amount,
            'currency': 'INR',
            'receipt': f'order_rcptid_{current_user.id}_{package_name}',
            'notes': {
                'package': package_name,
                'tokens': package['tokens'],
                'user_id': current_user.id
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        # Create transaction record
        transaction = Transaction(
            user_id=current_user.id,
            amount=package['amount'],
            tokens_purchased=package['tokens'],
            payment_status='pending',
            razorpay_order_id=order['id']
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'order_id': order['id'],
            'amount': amount / 100,  # Convert back to main currency unit for display
            'currency': 'INR',
            'key_id': os.environ.get('RAZORPAY_KEY_ID')
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Razorpay error: {str(e)}'}), 500

@payment_bp.route('/verify-payment', methods=['POST'])
@login_required
def verify_payment():
    # Check if Razorpay client is initialized
    if razorpay_client is None:
        # For development/testing, simulate a successful payment verification
        return jsonify({
            'message': 'Test mode: Payment verified successfully',
            'transaction_id': 0,
            'tokens_added': 0,
            'current_tokens': current_user.tokens
        }), 200
    
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('razorpay_order_id') or not data.get('razorpay_payment_id') or not data.get('razorpay_signature'):
        return jsonify({'error': 'Missing payment verification details'}), 400
    
    # Verify the payment signature
    params_dict = {
        'razorpay_order_id': data.get('razorpay_order_id'),
        'razorpay_payment_id': data.get('razorpay_payment_id'),
        'razorpay_signature': data.get('razorpay_signature')
    }
    
    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update transaction record
        transaction = Transaction.query.filter_by(razorpay_order_id=data.get('razorpay_order_id')).first()
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        transaction.payment_status = 'completed'
        transaction.razorpay_payment_id = data.get('razorpay_payment_id')
        transaction.razorpay_signature = data.get('razorpay_signature')
        
        # Add tokens to user account
        current_user.add_tokens(transaction.tokens_purchased)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Payment verified successfully',
            'transaction_id': transaction.id,
            'tokens_added': transaction.tokens_purchased,
            'current_tokens': current_user.tokens
        }), 200
        
    except Exception as e:
        # Update transaction record as failed
        transaction = Transaction.query.filter_by(razorpay_order_id=data.get('razorpay_order_id')).first()
        
        if transaction:
            transaction.payment_status = 'failed'
            db.session.commit()
            
        return jsonify({'error': 'Payment verification failed', 'details': str(e)}), 400

@payment_bp.route('/transactions', methods=['GET'])
@login_required
def get_transactions():
    transactions = Transaction.query.filter_by(user_id=current_user.id).order_by(Transaction.transaction_date.desc()).all()
    
    return jsonify({
        'transactions': [{
            'id': t.id,
            'amount': t.amount,
            'tokens_purchased': t.tokens_purchased,
            'payment_status': t.payment_status,
            'transaction_date': t.transaction_date.isoformat()
        } for t in transactions]
    }), 200 