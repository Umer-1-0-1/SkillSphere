@echo off
echo ========================================
echo SkillSphere Sprint Test Runner
echo ========================================
echo.

REM Check if backend is running
echo Checking if backend is running on port 8000...
curl -s http://localhost:8000/api/courses/categories/ >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running!
    echo Please start the backend server first: python manage.py runserver
    echo.
    pause
    exit /b 1
)

echo [OK] Backend is running
echo.

REM Check if frontend is running
echo Checking if frontend is running on port 3000...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Frontend might not be running on port 3000
    echo Tests will continue but UI tests may fail
    echo.
)

echo [OK] Frontend check complete
echo.

REM Run tests
echo Running test suite...
echo.
python test_sprint.py

echo.
echo ========================================
echo Test execution completed
echo Check test_report_*.json for details
echo ========================================
pause
