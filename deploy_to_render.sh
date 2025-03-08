#!/bin/bash

# This script helps deploy the quiz app to Render with Gunicorn

echo "Quiz App Deployment to Render with Gunicorn"
echo "=========================================="
echo ""
echo "This script will guide you through deploying your Quiz App to Render's free tier using Gunicorn."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install Git first."
    exit 1
fi

# Check if the app is already in a git repository
if [ ! -d .git ]; then
    echo "This directory is not a git repository. Let's initialize it."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check if the app is already pushed to GitHub
echo "Is your code already pushed to GitHub? (y/n)"
read already_pushed

if [ "$already_pushed" != "y" ]; then
    echo "Let's push your code to GitHub."
    echo "Enter your GitHub username:"
    read username
    
    echo "Enter your repository name (default: quiz-app):"
    read repo_name
    repo_name=${repo_name:-quiz-app}
    
    # Check if remote origin already exists
    if git remote | grep -q "^origin$"; then
        echo "Remote 'origin' already exists. Updating it..."
        git remote set-url origin "https://github.com/$username/$repo_name.git"
    else
        echo "Setting up remote origin..."
        git remote add origin "https://github.com/$username/$repo_name.git"
    fi
    
    echo "Pushing to GitHub..."
    git branch -M main
    git push -u origin main
    
    echo "Code pushed to GitHub: https://github.com/$username/$repo_name"
fi

echo ""
echo "Now let's deploy to Render with Gunicorn:"
echo "1. Go to https://dashboard.render.com/blueprints"
echo "2. Click 'New Blueprint Instance'"
echo "3. Connect your GitHub account if you haven't already"
echo "4. Select your repository: $repo_name"
echo "5. Click 'Apply Blueprint'"
echo ""
echo "Render will automatically deploy your:"
echo "- PostgreSQL database (free tier)"
echo "- Backend web service with Gunicorn (free tier)"
echo "- Frontend static site (free tier)"
echo ""
echo "Your app is configured with optimized Gunicorn settings:"
echo "- 2 workers: Good balance for free tier resources"
echo "- 4 threads per worker: Handles more concurrent requests"
echo "- gthread worker class: Better performance for web apps"
echo ""
echo "Don't forget to set up these environment variables when prompted:"
echo "- RAZORPAY_KEY_ID"
echo "- RAZORPAY_KEY_SECRET"
echo "- SMTP_USERNAME (for password reset emails)"
echo "- SMTP_PASSWORD"
echo ""
echo "For more details, see RENDER_GUNICORN_DEPLOYMENT.md"

# Open Render dashboard in browser if possible
if command -v xdg-open &> /dev/null; then
    xdg-open "https://dashboard.render.com/blueprints" &
elif command -v open &> /dev/null; then
    open "https://dashboard.render.com/blueprints" &
else
    echo "Visit https://dashboard.render.com/blueprints to continue deployment"
fi 