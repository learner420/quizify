@echo off
echo This script helps upload the quiz app to GitHub

REM Initialize git repository if not already initialized
if not exist .git (
  echo Initializing git repository...
  git init
)

REM Add all files to git
echo Adding files to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Initial commit of Quiz App"

REM Prompt for GitHub username
set /p username=Enter your GitHub username: 

REM Prompt for repository name
set /p repo_name=Enter your repository name (default: quiz-app): 
if "%repo_name%"=="" set repo_name=quiz-app

REM Set up remote origin
echo Setting up remote origin...
git remote add origin https://github.com/%username%/%repo_name%.git

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo Done! Your code has been uploaded to https://github.com/%username%/%repo_name%
echo Now you can deploy it on Render using the instructions in the README.md file.
pause 