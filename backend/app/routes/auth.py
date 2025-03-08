from flask import Blueprint, request, jsonify, current_app, url_for
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
import re
from app.utils.email import send_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate email format
    if not EMAIL_REGEX.match(data.get('email')):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    new_user = User(
        username=data.get('username'),
        email=data.get('email')
    )
    new_user.set_password(data.get('password'))
    
    # Make the first user an admin
    if User.query.count() == 0:
        new_user.role = 'admin'
        new_user.tokens = 100  # Give admin plenty of tokens
    
    # Add to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': new_user.id,
            'username': new_user.username,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Log in the user
    login_user(user)
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'tokens': user.tokens,
            'role': user.role
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/profile', methods=['GET'])
@login_required
def profile():
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'tokens': current_user.tokens,
            'role': current_user.role,
            'created_at': current_user.created_at.isoformat()
        }
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Don't reveal that the user doesn't exist
        return jsonify({'message': 'If an account exists with this email, you will receive a password reset link'}), 200
    
    # Generate reset token
    token = user.generate_reset_token()
    
    # Create reset link
    reset_link = f"{request.host_url}reset-password?token={token}&email={email}"
    
    # Send email
    try:
        send_email(
            to=email,
            subject='Password Reset Request',
            body=f'''To reset your password, visit the following link:
{reset_link}

If you did not make this request then simply ignore this email and no changes will be made.

This link will expire in 1 hour.
'''
        )
        return jsonify({'message': 'If an account exists with this email, you will receive a password reset link'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': 'Failed to send reset email'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('email') or not data.get('new_password'):
        return jsonify({'error': 'Token, email and new password are required'}), 400
    
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user:
        return jsonify({'error': 'Invalid or expired reset link'}), 400
    
    if not user.verify_reset_token(data.get('token')):
        return jsonify({'error': 'Invalid or expired reset link'}), 400
    
    # Set new password
    user.set_password(data.get('new_password'))
    user.clear_reset_token()
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200 