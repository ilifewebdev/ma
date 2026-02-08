#!/bin/bash

echo "----------------------------------------"
echo "   GitHub Deployment Script"
echo "----------------------------------------"

# check git
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed or not in PATH."
    exit 1
fi

echo "1. Initializing Git..."
git init

echo "2. Adding files..."
git add .

echo "3. Committing..."
git commit -m "Initial commit for GitHub Deployment"

echo "----------------------------------------"
echo "Please create a new repository on GitHub (https://github.com/new)"
echo "Do NOT initialize it with README, .gitignore, or License."
echo "----------------------------------------"
read -p "Enter your GitHub Repository URL (e.g., https://github.com/user/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "Error: Repository URL cannot be empty."
    exit 1
fi

echo "4. Adding remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo "5. Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "----------------------------------------"
echo "Done! Now go to your GitHub Repo -> Settings -> Pages"
echo "and select 'main' branch to enable GitHub Pages."
echo "----------------------------------------"
read -p "Press Enter to exit..."
