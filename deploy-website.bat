@echo off
echo ===================================
echo MelonMC Website Deployment Helper
echo ===================================
echo.

echo Preparing deployment files...
node deploy-github-automated.js
echo.

echo ===================================
echo Deployment process complete!
echo.
echo If you need to manually create your GitHub repository:
echo 1. Go to https://github.com/new
echo 2. Create a repository named "AyushAJogania.github.io"
echo 3. Follow the instructions provided by the deployment script
echo.
echo Your website should be available at: https://AyushAJogania.github.io
echo ===================================

pause
 