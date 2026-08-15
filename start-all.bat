@echo off
echo Iniciando Sistema RBF Motos...
echo.
echo Gerando Prisma Client...
call npx prisma generate
echo.
echo Iniciando servidores...
start "Backend - Porta 9001" cmd /k "npm run server"
timeout /t 3 /nobreak > nul
start "Frontend - Porta 5174" cmd /k "npm run dev"
echo.
echo Servidores iniciados!
echo Backend: http://localhost:9001
echo Frontend: http://localhost:5174
echo.
pause
