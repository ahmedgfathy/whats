@echo off
echo Installing Backend Dependencies...
cd backend
call npm install

echo.
echo Starting Backend Server...
call npm run dev
