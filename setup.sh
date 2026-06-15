#!/bin/bash
# TaskFlow - Script de setup rápido
echo "🚀 Instalando dependências..."

cd backend && npm install
echo "✅ Backend pronto"

cd ../frontend && npm install
echo "✅ Frontend pronto"

echo ""
echo "Para rodar:"
echo "  Terminal 1 → cd backend && npm run dev"
echo "  Terminal 2 → cd frontend && npm run dev"
echo ""
echo "Acesse: http://localhost:5173"
