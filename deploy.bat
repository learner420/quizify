@echo off
echo Quiz App Deployment Helper
echo ========================
echo.

:menu
echo Choose an option:
echo 1. Initialize Git repository
echo 2. Commit changes
echo 3. Push to GitHub
echo 4. Exit
echo.

set /p choice=Enter your choice (1-4): 

if "%choice%"=="1" goto init_git
if "%choice%"=="2" goto commit
if "%choice%"=="3" goto push
if "%choice%"=="4" goto end

echo Invalid choice. Please try again.
goto menu

:init_git
echo Initializing Git repository...
git init
git add .
git commit -m "Initial commit"
echo Git repository initialized successfully!
echo.
goto menu

:commit
set /p message=Enter commit message: 
git add .
git commit -m "%message%"
echo Changes committed successfully!
echo.
goto menu

:push
echo Checking if remote exists...
git remote -v | findstr "origin" > nul
if %errorlevel% neq 0 (
    set /p repo=Enter GitHub repository URL: 
    git remote add origin %repo%
)
echo Pushing to GitHub...
git push -u origin master
echo.
echo Pushed to GitHub successfully!
echo.
echo To deploy to Render:
echo 1. Go to https://dashboard.render.com/
echo 2. Connect your GitHub repository
echo 3. Use the render.yaml file for configuration
echo 4. Set up the environment variables:
echo    - RAZORPAY_KEY_ID
echo    - RAZORPAY_KEY_SECRET
echo    - OPENAI_API_KEY
echo.
goto menu

:end
echo Goodbye!
exit /b 0 