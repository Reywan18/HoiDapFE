@echo off
chcp 65001 > nul
echo Dang tao tai khoan Sinh Vien mau...
echo Email: sinhvien
echo Pass: 1
echo ------------------------------------------
curl -X POST http://localhost:8080/api/setup/create-student -H "Content-Type: application/json" -d "{\"email\":\"sinhvien\", \"password\":\"1\", \"hoTen\":\"Nguyen Van A\", \"soDienThoai\":\"0912345678\"}"
echo.
echo ------------------------------------------
echo Bay gio ban co the Login bang tai khoan: sinhvien / 1
echo Nhan phim bat ky de thoat...
pause
