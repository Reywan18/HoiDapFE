@echo off
chcp 65001 > nul
echo Dang tao tai khoan CVHT...
echo Email: covan
echo Pass: 1
echo ------------------------------------------
curl -X POST http://localhost:8080/api/setup/create-cvht -H "Content-Type: application/json" -d "{\"email\":\"covan\", \"password\":\"1\", \"hoTen\":\"Co Van Hoc Tap A\", \"soDienThoai\":\"0987654321\"}"
echo.
echo ------------------------------------------
echo Tao xong! Ban co the dang nhap ngay.
echo Nhan phim bat ky de thoat...
pause
