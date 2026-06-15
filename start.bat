@echo off
echo Iniciando TaskFlow...
echo.
echo Abrindo backend na porta 3001...
start cmd /k "cd backend && npm install && npm run dev"
timeout /t 3 /nobreak >nul
echo Abrindo frontend na porta 5173...
start cmd /k "cd frontend && npm install && npm run dev"
echo.
echo Aguarde alguns segundos e acesse: http://localhost:5173
