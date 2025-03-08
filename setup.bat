@echo off
echo Setting up Quiz App...

echo Setting up backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt

echo Initializing database...
python init_db.py

echo Setup completed successfully!
echo.
echo To run the application, use run.bat
echo.
echo Demo user credentials:
echo   Username: demo_user
echo   Email: demo@example.com
echo   Password: password123
echo.
pause 