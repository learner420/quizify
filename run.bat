@echo off
echo Starting Quiz App...

echo Setting up backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt

echo Starting backend server...
start cmd /k "call venv\Scripts\activate && python run.py"

echo Setting up frontend...
cd ..
cd frontend
echo Installing frontend dependencies...
start cmd /k "cd frontend && npm install && npm start"

echo Quiz App started successfully!
echo Backend running at http://localhost:5000
echo Frontend running at http://localhost:3000 