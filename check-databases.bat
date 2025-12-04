@echo off
echo ========================================
echo Cek Database PostgreSQL
echo ========================================
echo.

set PGPASSWORD=12345678

echo Daftar semua databases:
echo.
psql -U postgres -c "\l"

echo.
echo ========================================
echo.

echo Cek apakah database 'hanzinarrative' ada:
echo.
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'hanzinarrative';"

echo.
pause
