@echo off
echo ========================================
echo   Starting English Learning Platform
echo   Frontend + Backend for Mobile
echo ========================================
echo.
echo   Use the IP address shown in the 'http-server' output below
echo   to access the app from your mobile device.
echo   Example: http://192.168.x.x:8080
echo.
echo ========================================

cd server
npm run dev:all

pause
