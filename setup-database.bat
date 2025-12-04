@echo off
echo ========================================
echo HanziNarrative - Database Setup
echo ========================================
echo.

echo [1/5] Setup PostgreSQL database dan user...
echo Anda akan diminta password PostgreSQL untuk user 'postgres'
echo.
psql -U postgres -f setup-postgres.sql
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Setup database gagal!
    echo Pastikan PostgreSQL sedang berjalan dan password benar.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Database dan user berhasil dibuat!
echo.

echo [3/5] Menjalankan migrations...
cd backend
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Migrations gagal!
    echo Check file backend/.env - DATABASE_URL harus benar.
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database dengan sample data...
python seed_data.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Seeding gagal!
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [5/5] Setup selesai!
cd ..
echo.
echo ========================================
echo Database siap digunakan!
echo ========================================
echo.
echo Login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Jalankan backend dengan:
echo   cd backend
echo   uvicorn app.main:app --reload
echo.
echo Atau gunakan: start-backend.bat
echo.
pause
