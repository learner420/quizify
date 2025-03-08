@echo off
echo Checking Quiz App...

echo Checking backend...
curl http://localhost:5000/api
echo.

echo Checking frontend...
curl http://localhost:3000
echo.

echo Check completed!
pause 