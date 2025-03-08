import os
import json
import requests
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app import db

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Helper function to get quiz directory path
def get_quiz_dir():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'quizzes')

@ai_bp.route('/generate-quiz', methods=['POST'])
@login_required
def generate_quiz():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('subject') or not data.get('topic') or not data.get('num_questions'):
        return jsonify({'error': 'Missing required fields (subject, topic, num_questions)'}), 400
    
    # Check if user has enough tokens
    num_questions = int(data.get('num_questions', 10))
    required_tokens = max(1, num_questions // 5)  # 1 token per 5 questions, minimum 1
    
    if current_user.tokens < required_tokens and not current_user.is_admin():
        return jsonify({'error': f'Not enough tokens. You need {required_tokens} tokens to generate this quiz.'}), 403
    
    subject = data.get('subject')
    topic = data.get('topic')
    difficulty = data.get('difficulty', 'medium')  # Default to medium difficulty
    
    # Sanitize subject and topic for filename
    subject_dir_name = ''.join(c if c.isalnum() else '_' for c in subject.lower())
    quiz_file_name = ''.join(c if c.isalnum() else '_' for c in topic.lower())
    
    # Create subject directory if it doesn't exist
    quiz_dir = get_quiz_dir()
    subject_dir = os.path.join(quiz_dir, subject_dir_name)
    
    if not os.path.exists(subject_dir):
        os.makedirs(subject_dir)
    
    # Check if quiz already exists
    quiz_file_path = os.path.join(subject_dir, f'{quiz_file_name}.json')
    if os.path.exists(quiz_file_path):
        return jsonify({'error': 'A quiz with this topic already exists in this subject'}), 409
    
    try:
        # Generate quiz using DeepSeek R1 through OpenRouter
        prompt = f"""
        Create a quiz on the topic of "{topic}" in the subject area of "{subject}" with {num_questions} multiple-choice questions.
        The difficulty level should be {difficulty}.
        
        Each question should have:
        1. A clear question
        2. Four possible options
        3. One correct answer
        4. A brief explanation of why the answer is correct
        
        Format the response as a JSON array where each question is an object with the following structure:
        {{
            "id": 1,
            "question": "What is the capital of France?",
            "options": ["Paris", "London", "Rome", "Berlin"],
            "correct_answer": "Paris",
            "explanation": "Paris is the capital of France."
        }}
        
        Only return the JSON array, nothing else.
        """
        
        # Using DeepSeek R1 through OpenRouter API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY', 'DEMO')}"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1:free",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that generates quiz questions in JSON format."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2048
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        response_data = response.json()
        
        # Parse the response
        quiz_data_text = response_data['choices'][0]['message']['content'].strip()
        
        # Extract JSON from the response (in case there's any extra text)
        quiz_data_text = quiz_data_text.replace("```json", "").replace("```", "").strip()
        quiz_data = json.loads(quiz_data_text)
        
        # Save the quiz to a file
        with open(quiz_file_path, 'w') as f:
            json.dump(quiz_data, f, indent=2)
        
        # Deduct tokens from user if not admin
        if not current_user.is_admin():
            current_user.use_token()
        
        return jsonify({
            'message': 'Quiz generated successfully',
            'subject': subject,
            'topic': topic,
            'file_path': f'{subject_dir_name}/{quiz_file_name}',
            'num_questions': len(quiz_data),
            'tokens_used': required_tokens,
            'tokens_remaining': current_user.tokens
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/subjects', methods=['GET'])
def get_ai_subjects():
    quiz_dir = get_quiz_dir()
    
    # Get all subject directories
    try:
        subjects = [d for d in os.listdir(quiz_dir) if os.path.isdir(os.path.join(quiz_dir, d))]
        return jsonify({'subjects': subjects}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500