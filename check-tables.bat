@echo off
echo ========================================
echo Cek Tables di Database hanzinarrative
echo ========================================
echo.

set PGPASSWORD=12345678

psql -U hanzinarrative -d hanzinarrative -c "\dt"

echo.
pause
