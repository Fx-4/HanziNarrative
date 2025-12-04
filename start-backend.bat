@echo off
echo ========================================
echo Starting HanziNarrative Backend Server
echo ========================================
echo.
echo Backend API will run on: http://localhost:8000
echo API Docs available at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
uvicorn app.main:app --reload
