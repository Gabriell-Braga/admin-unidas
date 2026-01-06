# 🔐 Sistema de Autenticação - Documentação Técnica

## ✅ O que foi implementado

### 1. **Redirecionamento da URL Raiz**
- URL `/` agora redireciona automaticamente baseado no estado de autenticação:
  - **Não autenticado** → `/login`
  - **Autenticado** → `/admin` (dashboard)
- Implementado via `middleware.ts` que intercepta todas as requisições

### 2. **Banco de Dados SQLite (Cloudflare D1)**
- ✅ Configuração de conexão em `lib/db.ts`
- ✅ Funções para interagir com o banco:
  - `createUser()` - Criar novo usuário
  - `getUserByEmail()` - Buscar usuário por email
  - `getSession()` - Obter dados da sessão
- ✅ Tabelas criadas via `migration.sql`:
  - `users` - Armazena dados de usuários
  - `forms` - Armazena formulários dos usuários

### 3. **Autenticação Completa**
Implementado em `lib/auth.ts`:
- ✅ `loginUser()` - Login com email e senha
- ✅ `registerUser()` - Registro de novo usuário
- ✅ `logoutUser()` - Logout e limpeza de sessão
- ✅ `hashPassword()` - Hash de senha (SHA256)
- ✅ `verifyPassword()` - Verificação de senha
- ✅ `getSessionUser()` - Obter usuário da sessão

### 4. **Páginas de Interface**

#### `/login` - Página de Login
- Formulário com email e senha
- Validações de cliente
- Feedback de erro em tempo real
- Link para registro

#### `/register` - Página de Registro
- Formulário com nome, email e senha
- Validação de confirmação de senha
- Status inicial: `pending` (aguardando aprovação)
- Feedback de sucesso

#### `/admin` - Dashboard
- **Para usuários comuns**: Visualização de formulários (em desenvolvimento)
- **Para admins**: Gerenciamento de usuários
  - Listar usuários pendentes
  - Aprovar usuários (status → `active`)
  - Bloquear usuários (status → `blocked`)
- Botão de logout no header

#### `/` - Página Raiz
- Redireciona automaticamente via middleware
- Não exibe conteúdo visual

### 5. **API Routes**

#### Autenticação (`/api/auth/`)
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário autenticado

#### Gerenciamento de Usuários (`/api/users/`)
- `GET /api/users/pending` - Lista usuários pendentes
- `POST /api/users/[userId]/approve` - Aprovar usuário
- `POST /api/users/[userId]/block` - Bloquear usuário

### 6. **Middleware de Proteção**
- `middleware.ts` valida cada requisição
- Protege rotas automática​mente
- Redireciona usuários não autenticados
- Impede acesso a rotas administrativas sem permissão

### 7. **Segurança**

#### Cookies Seguros
```javascript
{
  httpOnly: true,      // Não acessível por JavaScript
  secure: true,        // Apenas HTTPS em produção
  sameSite: "lax",     // Proteção CSRF
  maxAge: 7 * 24 * 60  // 7 dias
}
```

#### Hash de Senhas
- SHA256 implementado
- ⚠️ **Recomendação**: Usar bcrypt em produção

#### Validações
- Email e senha obrigatórios
- Validação de status do usuário:
  - `pending` - Acesso negado
  - `active` - Acesso permitido
  - `blocked` - Acesso negado

## 📁 Estrutura de Arquivos Criados

```
├── middleware.ts                          # Middleware de autenticação
├── lib/
│   ├── db.ts                             # Conexão D1 e funções
│   └── auth.ts                           # Funções de autenticação
├── src/app/
│   ├── page.tsx                          # Página raiz (redireciona)
│   ├── unauthorized/page.tsx             # Página de acesso negado
│   ├── login/page.tsx                    # ✅ Atualizado
│   ├── register/page.tsx                 # ✅ Atualizado
│   ├── admin/page.tsx                    # ✅ Atualizado
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts            # POST - Login
│       │   ├── register/route.ts         # POST - Registro
│       │   ├── logout/route.ts           # POST - Logout
│       │   └── me/route.ts               # GET - Dados do usuário
│       └── users/
│           ├── pending/route.ts          # GET - Usuários pendentes
│           └── [userId]/
│               ├── approve/route.ts      # POST - Aprovar
│               └── block/route.ts        # POST - Bloquear
├── scripts/
│   └── create-admin.js                   # Script para criar admin
├── wrangler.json                         # ✅ Configuração D1
├── migration.sql                         # ✅ Schema do banco
└── SETUP.md                              # ✅ Guia de configuração
```

## 🚀 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Cloudflare D1
```bash
# Criar banco de dados no Cloudflare Dashboard
# Copiar database_id e atualizar wrangler.json
```

### 3. Executar migration
```bash
npx wrangler d1 execute forms_db --remote --file=./migration.sql
```

### 4. Criar usuário admin (opcional)
```bash
npm run create-admin -- admin@example.com senha123 "Admin User"
```

### 5. Iniciar desenvolvimento
```bash
npm run dev
```

### 6. Testar o fluxo
1. Acesse `http://localhost:3000` → Redireciona para `/login`
2. Clique em "Cadastre-se" → `/register`
3. Preencha o formulário → Status fica `pending`
4. Login com admin → Aprova o novo usuário
5. Login com novo usuário → Acessa `/admin`

## 🔄 Fluxo de Autenticação

```
┌─────────────────┐
│  URL Raiz (/)   │
└────────┬────────┘
         │
    [Middleware]
         │
         ├─── Sem Cookie? ──→ /login
         └─── Com Cookie? ──→ /admin
         
┌─────────────────┐
│   Login Page    │
└────────┬────────┘
         │
    [POST /api/auth/login]
         │
         ├─── Email não existe? ──→ Erro
         ├─── Status pending? ──→ Erro (aguardando aprovação)
         ├─── Status blocked? ──→ Erro (conta bloqueada)
         └─── Senha incorreta? ──→ Erro
              │
              └─ Sucesso → Set Cookie → /admin
         
┌──────────────────┐
│ Register Page    │
└────────┬─────────┘
         │
    [POST /api/auth/register]
         │
         ├─── Email existe? ──→ Erro
         └─── Sucesso → Status pending → /login
```

## 📊 Estados de Usuário

```
pending  → Aguardando aprovação de admin
active   → Acesso permitido
blocked  → Acesso negado (bloqueado por admin)
```

## 🛠️ Funções Principais

### lib/db.ts
- `db` - Instância do banco D1
- `getSession()` - Obter sessão do cookie
- `createUser()` - Criar usuário
- `getUserByEmail()` - Buscar por email

### lib/auth.ts
- `loginUser()` - Fazer login
- `registerUser()` - Registrar usuário
- `logoutUser()` - Fazer logout
- `hashPassword()` - Hash da senha
- `verifyPassword()` - Verificar senha
- `getSessionUser()` - Dados do usuário logado

## 🔐 Variáveis de Ambiente

```env
# .env.local
D1_DATABASE_ID=YOUR_DATABASE_ID
NODE_ENV=development
CF_ACCOUNT_ID=YOUR_ACCOUNT_ID
CF_API_TOKEN=YOUR_API_TOKEN
```

## ⚠️ Considerações Importantes

1. **Segurança em Produção**:
   - ✅ Usar bcrypt para hash de senhas
   - ✅ Implementar rate limiting
   - ✅ Usar JWT com expiração
   - ✅ HTTPS obrigatório
   - ✅ Headers de segurança

2. **Performance**:
   - ✅ Cache de sessão
   - ✅ Otimizar queries D1
   - ✅ Usar índices no banco

3. **Melhorias Futuras**:
   - [ ] 2FA (autenticação de dois fatores)
   - [ ] OAuth (Google, GitHub, etc)
   - [ ] Reset de senha por email
   - [ ] Audit log de ações
   - [ ] Roles mais granulares

## 📞 Suporte

Para dúvidas:
- Consulte [SETUP.md](./SETUP.md)
- Cloudflare D1 Docs: https://developers.cloudflare.com/d1/
- Next.js Docs: https://nextjs.org/docs
