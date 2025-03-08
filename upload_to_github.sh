#!/bin/bash

# This script helps upload the quiz app to GitHub

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
fi

# Add all files to git
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Initial commit of Quiz App"

# Prompt for GitHub username
echo "Enter your GitHub username:"
read username

# Prompt for repository name
echo "Enter your repository name (default: quiz-app):"
read repo_name
repo_name=${repo_name:-quiz-app}

# Set up remote origin
echo "Setting up remote origin..."
git remote add origin https://github.com/$username/$repo_name.git

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Your code has been uploaded to https://github.com/$username/$repo_name"
echo "Now you can deploy it on Render using the instructions in the README.md file." 