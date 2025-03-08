@echo off
echo Quiz App Deployment to Render
echo ============================
echo.
echo This script will guide you through deploying your Quiz App to Render's free tier.
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git first.
    pause
    exit /b
)

REM Check if the app is already in a git repository
if not exist .git (
    echo This directory is not a git repository. Let's initialize it.
    git init
    git add .
    git commit -m "Initial commit"
)

REM Check if the app is already pushed to GitHub
set /p already_pushed=Is your code already pushed to GitHub? (y/n): 

if not "%already_pushed%"=="y" (
    echo Let's push your code to GitHub.
    set /p username=Enter your GitHub username: 
    
    set /p repo_name=Enter your repository name (default: quiz-app): 
    if "%repo_name%"=="" set repo_name=quiz-app
    
    REM Check if remote origin already exists
    git remote | findstr "^origin$" >nul
    if %ERRORLEVEL% EQU 0 (
        echo Remote 'origin' already exists. Updating it...
        git remote set-url origin "https://github.com/%username%/%repo_name%.git"
    ) else (
        echo Setting up remote origin...
        git remote add origin "https://github.com/%username%/%repo_name%.git"
    )
    
    echo Pushing to GitHub...
    git branch -M main
    git push -u origin main
    
    echo Code pushed to GitHub: https://github.com/%username%/%repo_name%
)

echo.
echo Now let's deploy to Render:
echo 1. Go to https://dashboard.render.com/blueprints
echo 2. Click 'New Blueprint Instance'
echo 3. Connect your GitHub account if you haven't already
echo 4. Select your repository: %repo_name%
echo 5. Click 'Apply Blueprint'
echo.
echo Render will automatically deploy your:
echo - PostgreSQL database (free tier)
echo - Backend web service (free tier)
echo - Frontend static site (free tier)
echo.
echo Don't forget to set up these environment variables when prompted:
echo - RAZORPAY_KEY_ID
echo - RAZORPAY_KEY_SECRET
echo - SMTP_USERNAME (for password reset emails)
echo - SMTP_PASSWORD
echo.
echo For more details, see RENDER_DEPLOYMENT.md

REM Open Render dashboard in browser
start https://dashboard.render.com/blueprints

pause 