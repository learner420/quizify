import os
import json
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app import db
from app.models.quiz_attempt import QuizAttempt

quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quizzes')

# Helper function to get quiz directory path
def get_quiz_dir():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'quizzes')

@quiz_bp.route('/', methods=['GET'])
def get_subjects():
    quiz_dir = get_quiz_dir()
    
    # Get all subject directories
    try:
        subjects = [d for d in os.listdir(quiz_dir) if os.path.isdir(os.path.join(quiz_dir, d))]
        return jsonify({'subjects': subjects}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/<subject>', methods=['GET'])
def get_quizzes(subject):
    quiz_dir = get_quiz_dir()
    subject_dir = os.path.join(quiz_dir, subject)
    
    # Check if subject directory exists
    if not os.path.exists(subject_dir) or not os.path.isdir(subject_dir):
        return jsonify({'error': 'Subject not found'}), 404
    
    # Get all quiz files in the subject directory
    try:
        quizzes = [f.replace('.json', '') for f in os.listdir(subject_dir) if f.endswith('.json')]
        return jsonify({'subject': subject, 'quizzes': quizzes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/<subject>/<quiz_name>', methods=['GET'])
@login_required
def get_quiz(subject, quiz_name):
    # Check if user has enough tokens - provide a specific error message for zero tokens
    if current_user.tokens < 1 and not current_user.is_admin():
        return jsonify({
            'error': 'You need at least 1 token to take this quiz',
            'tokens': current_user.tokens,
            'needs_tokens': True
        }), 403
    
    quiz_dir = get_quiz_dir()
    quiz_file = os.path.join(quiz_dir, subject, f'{quiz_name}.json')
    
    # Check if quiz file exists
    if not os.path.exists(quiz_file) or not os.path.isfile(quiz_file):
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Check if this is a new attempt request
    force_new_attempt = request.args.get('new_attempt') == 'true'
    
    # Generate a unique attempt ID for this session
    attempt_id = request.args.get('attempt_id')
    
    # Check if user has already taken this quiz
    existing_attempt = None
    if attempt_id and not force_new_attempt:
        # If an attempt_id is provided, try to find that specific attempt
        existing_attempt = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name,
            id=attempt_id
        ).first()
    elif not force_new_attempt:
        # Otherwise, check if there's any incomplete attempt for this quiz
        existing_attempts = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name
        ).all()
        
        # Consider an attempt as "incomplete" if it has a score = 0 and total_questions = 0
        incomplete_attempts = [a for a in existing_attempts if a.score == 0 and a.total_questions == 0]
        
        if incomplete_attempts:
            # Use the most recent incomplete attempt
            existing_attempt = incomplete_attempts[0]
    
    # Debug information
    print(f"User: {current_user.username}, Tokens: {current_user.tokens}, Is Admin: {current_user.is_admin()}")
    print(f"Force new attempt: {force_new_attempt}")
    print(f"Existing attempt: {existing_attempt}")
    
    # Deduct token if this is a new attempt and user is not admin
    token_deducted = False
    new_attempt_id = None
    
    if (force_new_attempt or not existing_attempt) and not current_user.is_admin():
        print(f"Attempting to deduct token from user {current_user.username} for a new attempt")
        token_deducted = current_user.use_token()
        print(f"Token deducted: {token_deducted}, New token balance: {current_user.tokens}")
        if not token_deducted:
            return jsonify({
                'error': 'Failed to deduct token. You need at least 1 token to take this quiz.',
                'tokens': current_user.tokens,
                'needs_tokens': True
            }), 403
        
        # Create a quiz attempt record to mark that the user has started this quiz
        quiz_attempt = QuizAttempt(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name,
            score=0,  # Initial score is 0
            total_questions=0  # Will be updated when quiz is submitted
        )
        db.session.add(quiz_attempt)
        db.session.commit()
        
        # Get the ID of the new attempt
        new_attempt_id = quiz_attempt.id
        existing_attempt = quiz_attempt
        
        print(f"Created new quiz attempt with ID: {new_attempt_id}")
    
    # Read quiz file
    try:
        with open(quiz_file, 'r') as f:
            quiz_data = json.load(f)
            
            # Remove correct answers for client-side rendering
            for question in quiz_data:
                if 'correct_answer' in question:
                    question['correct_answer_index'] = question['options'].index(question['correct_answer'])
                    del question['correct_answer']
            
            return jsonify({
                'subject': subject, 
                'quiz_name': quiz_name, 
                'questions': quiz_data,
                'token_required': True,
                'user_tokens': current_user.tokens,
                'has_attempted': existing_attempt is not None,
                'token_deducted': token_deducted,
                'attempt_id': new_attempt_id or (existing_attempt.id if existing_attempt else None),
                'is_new_attempt': force_new_attempt or not existing_attempt
            }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quiz_bp.route('/<subject>/<quiz_name>/submit', methods=['POST'])
@login_required
def submit_quiz(subject, quiz_name):
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('answers'):
        return jsonify({'error': 'Missing answers'}), 400
    
    quiz_dir = get_quiz_dir()
    quiz_file = os.path.join(quiz_dir, subject, f'{quiz_name}.json')
    
    # Check if quiz file exists
    if not os.path.exists(quiz_file) or not os.path.isfile(quiz_file):
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Get the attempt ID if provided
    attempt_id = data.get('attempt_id')
    
    # Check if we should preserve the existing score (used by QuizResults to get details without changing score)
    preserve_score = data.get('preserve_score', False)
    
    # Get the user's answers
    user_answers = data.get('answers', [])
    
    # Check if user has already taken this quiz
    existing_attempt = None
    if attempt_id:
        # If an attempt_id is provided, try to find that specific attempt
        existing_attempt = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name,
            id=attempt_id
        ).first()
    else:
        # Otherwise, find the most recent attempt
        existing_attempt = QuizAttempt.query.filter_by(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name
        ).order_by(QuizAttempt.attempt_date.desc()).first()
    
    # If no attempt exists, create one now (this handles cases where the session expired or page was refreshed)
    # But DO NOT deduct tokens here - tokens should only be deducted when starting a quiz
    if not existing_attempt:
        print(f"No existing attempt found for user {current_user.username} on quiz {subject}/{quiz_name}. Creating one now.")
        
        # Create a new quiz attempt without deducting tokens
        existing_attempt = QuizAttempt(
            user_id=current_user.id,
            subject=subject,
            quiz_name=quiz_name,
            score=0,
            total_questions=0
        )
        db.session.add(existing_attempt)
        db.session.commit()
        
        print(f"Created new quiz attempt for user {current_user.username}")
    
    # Store the original score and total questions if we need to preserve them
    original_score = existing_attempt.score
    original_total_questions = existing_attempt.total_questions
    
    # Always store the user's answers in the attempt record
    existing_attempt.set_user_answers(user_answers)
    db.session.commit()
    print(f"Stored user answers for attempt {existing_attempt.id}")
    
    # Read quiz file to check answers
    try:
        with open(quiz_file, 'r') as f:
            quiz_data = json.load(f)
            
            # Calculate score
            score = 0
            total_questions = len(quiz_data)
            
            results = []
            
            for i, question in enumerate(quiz_data):
                # Ensure we have a valid question with all required fields
                if not isinstance(question, dict) or 'question' not in question or 'options' not in question or 'correct_answer' not in question:
                    print(f"Warning: Invalid question format at index {i}")
                    continue
                    
                user_answer = ''
                if i < len(user_answers):
                    user_answer = user_answers[i]
                
                is_correct = user_answer == question['correct_answer']
                
                if is_correct:
                    score += 1
                
                # Create a result object with all required fields
                result = {
                    'question': question['question'],
                    'options': question['options'],
                    'user_answer': user_answer,
                    'correct_answer': question['correct_answer'],
                    'is_correct': is_correct,
                    'explanation': question.get('explanation', 'No explanation provided.')
                }
                
                results.append(result)
            
            # Update the quiz attempt with the score, unless we're preserving the original score
            if not preserve_score:
                existing_attempt.score = score
                existing_attempt.total_questions = total_questions
                db.session.commit()
                print(f"Updated quiz attempt {existing_attempt.id} with score {score}/{total_questions}")
            else:
                print(f"Preserving original score {original_score}/{original_total_questions} for attempt {existing_attempt.id}")
                # Use the original score for the response
                score = original_score
                total_questions = original_total_questions
            
            return jsonify({
                'message': 'Quiz submitted successfully',
                'score': score,
                'total_questions': total_questions,
                'percentage': (score / total_questions) * 100 if total_questions > 0 else 0,
                'results': results,
                'tokens_remaining': current_user.tokens,
                'attempt_id': existing_attempt.id,
                'user_answers': user_answers  # Include user answers in the response
            }), 200
    except Exception as e:
        print(f"Error submitting quiz: {str(e)}")
        # Return a minimal response with empty results array
        return jsonify({
            'error': str(e),
            'score': 0,
            'total_questions': 0,
            'percentage': 0,
            'results': []
        }), 500

@quiz_bp.route('/attempts', methods=['GET'])
@login_required
def get_attempts():
    attempts = QuizAttempt.query.filter_by(user_id=current_user.id).order_by(QuizAttempt.attempt_date.desc()).all()
    
    return jsonify({
        'attempts': [{
            'id': a.id,
            'subject': a.subject,
            'quiz_name': a.quiz_name,
            'score': a.score,
            'total_questions': a.total_questions,
            'percentage': (a.score / a.total_questions) * 100 if a.total_questions > 0 else 0,
            'attempt_date': a.attempt_date.isoformat(),
            'user_answers': a.get_user_answers()
        } for a in attempts]
    }), 200 