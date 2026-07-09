@echo off
echo =======================================
echo BBMS Setup Script
echo =======================================
echo.

echo Installing Server Dependencies...
cd server
call npm install
echo.

echo Seeding Database (assuming MongoDB is running on localhost:27017)...
call npm run seed
cd ..
echo.

echo Installing Client Dependencies...
cd client
call npm install
cd ..
echo.

echo =======================================
echo Setup Complete! You can now run start.bat
echo =======================================
pause
