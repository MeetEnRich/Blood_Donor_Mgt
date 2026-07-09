@echo off
echo =======================================
echo Starting BBMS (Blood Bank Management System)
echo =======================================
echo.

echo Starting Backend Server...
start "BBMS Backend" cmd /k "cd server && npm run dev"

echo Starting Frontend Client...
start "BBMS Frontend" cmd /k "cd client && npm run dev"

echo =======================================
echo Both servers are starting in new windows.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo =======================================
