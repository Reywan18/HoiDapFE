@echo off
chcp 65001 >nul
title TLQNA Launcher
echo ==========================================
echo      KHOI DONG LAI HE THONG (Auto)
echo ==========================================

echo [1] Dang dung cac tien trinh cu (Java, Node)...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo [2] Dang khoi dong Backend...
echo     (Dang build file JAR, se mat khoang vai giay...)
set BACKEND_DIR=%~dp0..\HoiDapApi\hoidapdemo
if exist "%BACKEND_DIR%\target\hoidapdemo-0.0.1-SNAPSHOT.jar" (
    cd /d "%BACKEND_DIR%"
    start "Backend Server" cmd /k "java -jar target\hoidapdemo-0.0.1-SNAPSHOT.jar"
) else (
    echo [LOI] Khong tim thay file JAR. Hay build Backend truoc!
    pause
    exit
)

echo.
echo [3] Dang khoi dong Frontend...
echo     (Cua so moi se hien ra)
set FRONTEND_DIR=%~dp0
cd /d "%FRONTEND_DIR%"
start "Frontend Client" cmd /k "npm run dev"

echo.
echo XONG! Hay doi vai giay de Backend va Frontend khoi dong xong, sau do F5 trinh duyet!
echo ==========================================
timeout /t 10
