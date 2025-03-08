from flask import Blueprint, jsonify
from flask_login import login_required

main_bp = Blueprint('main', __name__, url_prefix='/api')

@main_bp.route('/', methods=['GET'])
def index():
    return jsonify({
        'message': 'Welcome to the Quiz App API',
        'status': 'online',
        'version': '1.0.0'
    }), 200

@main_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'API is running correctly'
    }), 200

@main_bp.route('/protected', methods=['GET'])
@login_required
def protected():
    return jsonify({
        'message': 'This is a protected route, you are authenticated!'
    }), 200 