@echo off
echo ----------------------------------------
echo    GitHub Deployment Script
echo ----------------------------------------

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH.
    pause
    exit /b
)

echo 1. Initializing Git...
git init

echo 2. Adding files...
git add .

echo 3. Committing...
git commit -m "Initial commit for GitHub Deployment"

echo ----------------------------------------
echo Please create a new repository on GitHub (https://github.com/new)
echo Do NOT initialize it with README, .gitignore, or License.
echo ----------------------------------------
set /p REPO_URL="Enter your GitHub Repository URL (e.g., https://github.com/user/repo.git): "

if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b
)

echo 4. Adding remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo 5. Pushing to GitHub...
git branch -M main
git push -u origin main

echo ----------------------------------------
echo Done! Now go to your GitHub Repo - Settings - Pages
echo and select 'main' branch to enable GitHub Pages.
echo ----------------------------------------
pause
