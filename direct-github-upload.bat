@echo off
echo ===================================
echo MelonMC Website GitHub Upload
echo ===================================
echo.

set GITHUB_USERNAME=ayushop123321
set REPO_NAME=%GITHUB_USERNAME%.github.io

echo Checking if git is installed...
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Git not found. Please install Git and try again.
    pause
    exit /b 1
)

echo Setting up Git repository...
git init
git checkout -b main
git add .
git config --local user.name "MelonMC Deployment"
git config --local user.email "deployment@melon-mc.fun"
git commit -m "MelonMC Website Deployment"

echo Pushing to GitHub...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
git push -f origin main

echo.
echo ===================================
echo Website uploaded to GitHub!
echo Your site will be available at: https://%GITHUB_USERNAME%.github.io
echo It may take a few minutes for GitHub Pages to build and deploy.
echo ===================================

pause 
 