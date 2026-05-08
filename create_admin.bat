@echo off
chcp 65001 > nul
echo Dang ket noi server de tao Admin...
echo Email: admin
echo Pass: 1
echo ------------------------------------------
curl -X POST http://localhost:8080/api/setup/create-admin -H "Content-Type: application/json" -d "{\"email\":\"admin\", \"password\":\"1\"}"
echo.
echo ------------------------------------------
echo Neu bao loi "Admin da ton tai", nghia la da tao roi.
echo Nhan phim bat ky de thoat...
pause
