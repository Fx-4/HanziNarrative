@echo off
echo ========================================
echo HanziNarrative - Database Setup (Fresh)
echo ========================================
echo.

echo [1/5] Cleaning up old database dan setup fresh...
echo Password PostgreSQL: 12345678
echo.

set PGPASSWORD=12345678
psql -U postgres -f cleanup-and-setup.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Setup database gagal!
    echo Pastikan PostgreSQL sedang berjalan.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Database bersih dan siap!
echo.

echo [3/5] Menjalankan migrations...
cd backend
alembic upgrade head
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Migrations gagal!
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [4/5] Seeding database dengan sample data...
py seed_data.py
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
echo Database FRESH siap digunakan!
echo ========================================
echo.
echo Database Info:
echo   - Database: hanzinarrative (FRESH/BARU)
echo   - User: hanzinarrative
echo   - Password: hanzinarrative_dev
echo.
echo Login credentials:
echo   - Username: admin
echo   - Password: admin123
echo.
echo Jalankan backend dengan:
echo   start-backend.bat
echo.
pause
