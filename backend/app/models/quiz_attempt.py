from datetime import datetime
from app import db
import json

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    quiz_name = db.Column(db.String(255), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    attempt_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_answers = db.Column(db.Text, nullable=True)  # JSON string of user answers
    
    def set_user_answers(self, answers):
        """Store user answers as a JSON string"""
        if answers:
            self.user_answers = json.dumps(answers)
        else:
            self.user_answers = None
    
    def get_user_answers(self):
        """Retrieve user answers as a list"""
        if self.user_answers:
            try:
                return json.loads(self.user_answers)
            except:
                return []
        return []
    
    def __repr__(self):
        return f'<QuizAttempt {self.id} - User {self.user_id} - Score {self.score}/{self.total_questions}>' 