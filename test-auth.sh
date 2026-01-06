#!/bin/bash

# Script de teste rápido do sistema de autenticação
# Uso: bash test-auth.sh

API_URL="http://localhost:3000/api"

echo "🧪 Testando Sistema de Autenticação"
echo "===================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Teste de Registro
echo -e "${YELLOW}1. Testando Registro (POST /api/auth/register)${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "senha123"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

# 2. Teste de Login (deve falhar - status pending)
echo -e "${YELLOW}2. Testando Login (POST /api/auth/login) - Deve falhar (pending)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "senha123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# 3. Teste de Login com Admin (se existir)
echo -e "${YELLOW}3. Testando Login com Admin${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "Response: $ADMIN_LOGIN"
echo ""

# 4. Teste de Get Me (deve falhar sem sessão)
echo -e "${YELLOW}4. Testando GET /api/auth/me (sem sessão)${NC}"
ME_RESPONSE=$(curl -s "$API_URL/auth/me")

echo "Response: $ME_RESPONSE"
echo ""

# 5. Teste de Logout
echo -e "${YELLOW}5. Testando Logout (POST /api/auth/logout)${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout")

echo "Response: $LOGOUT_RESPONSE"
echo ""

echo -e "${GREEN}✅ Testes completados!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Criar usuário admin via: npm run create-admin -- admin@example.com senha123 Admin"
echo "2. Fazer login com admin"
echo "3. Aprovar usuário test_user via API"
echo "4. Login com test_user"
