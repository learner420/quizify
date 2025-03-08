from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.user import User
from app.models.transaction import Transaction
from app.routes.payment import TOKEN_PACKAGES
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Admin decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Get all users
@admin_bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    users = User.query.all()
    return jsonify({
        'users': [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tokens': user.tokens,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        } for user in users]
    }), 200

# Get user by ID
@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
@admin_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tokens': user.tokens,
            'role': user.role,
            'created_at': user.created_at.isoformat()
        }
    }), 200

# Update user tokens
@admin_bp.route('/users/<int:user_id>/tokens', methods=['PUT'])
@login_required
@admin_required
def update_user_tokens(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data or 'tokens' not in data:
        return jsonify({'error': 'Tokens value is required'}), 400
    
    try:
        tokens = int(data['tokens'])
        if tokens < 0:
            return jsonify({'error': 'Tokens cannot be negative'}), 400
        
        # Record the transaction
        transaction = Transaction(
            user_id=user.id,
            amount=0,  # Admin adjustment, no cost
            tokens_purchased=tokens - user.tokens,  # Can be negative if reducing tokens
            payment_status='completed',
            razorpay_order_id=f"admin_adjustment_{current_user.id}"
        )
        
        # Update user tokens
        user.tokens = tokens
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'User tokens updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'tokens': user.tokens
            }
        }), 200
    except ValueError:
        return jsonify({'error': 'Invalid token value'}), 400

# Update user role
@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@login_required
@admin_required
def update_user_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    if not data or 'role' not in data:
        return jsonify({'error': 'Role is required'}), 400
    
    role = data['role']
    if role not in ['user', 'admin']:
        return jsonify({'error': 'Invalid role. Must be "user" or "admin"'}), 400
    
    user.role = role
    db.session.commit()
    
    return jsonify({
        'message': 'User role updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }
    }), 200

# Get token packages
@admin_bp.route('/token-packages', methods=['GET'])
@login_required
@admin_required
def get_token_packages():
    return jsonify({
        'packages': TOKEN_PACKAGES
    }), 200

# Update token packages
@admin_bp.route('/token-packages', methods=['PUT'])
@login_required
@admin_required
def update_token_packages():
    data = request.get_json()
    
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid data format'}), 400
    
    # Update the global TOKEN_PACKAGES variable
    global TOKEN_PACKAGES
    
    for package_name, package_data in data.items():
        if not isinstance(package_data, dict) or 'amount' not in package_data or 'tokens' not in package_data:
            return jsonify({'error': f'Invalid package data for {package_name}'}), 400
        
        try:
            amount = int(package_data['amount'])
            tokens = int(package_data['tokens'])
            
            if amount < 0 or tokens < 0:
                return jsonify({'error': 'Amount and tokens cannot be negative'}), 400
            
            # Update the package
            if package_name in TOKEN_PACKAGES:
                TOKEN_PACKAGES[package_name] = {'amount': amount, 'tokens': tokens}
            else:
                TOKEN_PACKAGES[package_name] = {'amount': amount, 'tokens': tokens}
                
        except ValueError:
            return jsonify({'error': 'Amount and tokens must be integers'}), 400
    
    return jsonify({
        'message': 'Token packages updated successfully',
        'packages': TOKEN_PACKAGES
    }), 200 