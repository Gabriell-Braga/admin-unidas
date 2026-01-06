# Sistema de Autenticação com Next.js e Cloudflare D1

## 🚀 Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados D1

#### No Cloudflare Dashboard:
1. Acesse o Cloudflare Dashboard
2. Vá para **Workers & Pages** → **D1**
3. Clique em **Create Database**
4. Nome: `forms_db`
5. Copie o `database_id`

#### No projeto:
1. Atualize `wrangler.json`:
   ```json
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "forms_db",
       "database_id": "YOUR_DATABASE_ID"
     }
   ]
   ```

### 3. Executar Migration do Banco

Usando Wrangler:
```bash
npx wrangler d1 execute forms_db --remote --file=./migration.sql
```

Ou localmente:
```bash
npx wrangler d1 execute forms_db --local --file=./migration.sql
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📋 Funcionalidades

### Fluxo de Autenticação

- **URL Raiz (`/`)**: 
  - Não autenticado → Redireciona para `/login`
  - Autenticado → Redireciona para `/admin`

- **Registro (`/register`)**:
  - Novo usuário cria conta
  - Status padrão: `pending` (aguardando aprovação)
  - Após registro, redireciona para login

- **Login (`/login`)**:
  - Email e senha
  - Valida status do usuário:
    - `pending`: Acesso negado (aguardando aprovação)
    - `active`: Cria sessão (cookie seguro)
    - `blocked`: Acesso negado (conta bloqueada)

- **Dashboard (`/admin`)**:
  - Usuários comuns: Visualizam seus formulários
  - Admins: Gerenciam usuários pendentes
    - Aprovar usuário → Status muda para `active`
    - Bloquear usuário → Status muda para `blocked`

- **Logout**:
  - Deleta cookie de sessão
  - Redireciona para `/login`

## 🛡️ Segurança

### Cookies
- **httpOnly**: `true` (não acessível por JavaScript)
- **secure**: `true` em produção
- **sameSite**: `lax`
- **maxAge**: 7 dias

### Senhas
- Hash SHA256 (considere usar bcrypt em produção)
- Nunca armazenar em plain text

### Middleware
- Valida autenticação em cada requisição
- Redireciona rotas protegidas automaticamente

## 📁 Estrutura de Arquivos

```
src/app/
├── page.tsx              # Página raiz (redireciona)
├── layout.tsx            # Layout principal
├── login/
│   └── page.tsx         # Página de login
├── register/
│   └── page.tsx         # Página de registro
├── admin/
│   └── page.tsx         # Dashboard/Admin
└── api/
    ├── auth/
    │   ├── login/route.ts
    │   ├── register/route.ts
    │   ├── logout/route.ts
    │   └── me/route.ts
    └── users/
        ├── pending/route.ts
        └── [userId]/
            ├── approve/route.ts
            └── block/route.ts

lib/
├── db.ts                # Conexão D1 e funções
└── auth.ts              # Funções de autenticação

middleware.ts            # Middleware de autenticação
```

## 🔑 API Endpoints

### Autenticação

**POST `/api/auth/login`**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**POST `/api/auth/register`**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**POST `/api/auth/logout`**
- Remove sessão do usuário

**GET `/api/auth/me`**
- Retorna dados do usuário autenticado

### Gerenciamento de Usuários (Admin)

**GET `/api/users/pending`**
- Lista usuários aguardando aprovação

**POST `/api/users/[userId]/approve`**
- Aprova um usuário (status → `active`)

**POST `/api/users/[userId]/block`**
- Bloqueia um usuário (status → `blocked`)

## 🗄️ Schema do Banco

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
  status TEXT CHECK(status IN ('pending', 'active', 'blocked')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSON NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 📝 Notas Importantes

1. **Senha padrão do admin**: Crie manualmente no banco ou implemente um script de seed
2. **Produção**: Use bcrypt para hash de senhas
3. **JWT**: Implemente tokens JWT para melhor segurança
4. **Rate Limiting**: Adicione rate limiting nas rotas de login/registro
5. **CORS**: Configure CORS adequadamente para produção

## 🚀 Deploy para Cloudflare Pages

```bash
npm run build
npm run deploy
```

## 📞 Suporte

Para dúvidas sobre a configuração, consulte:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Next.js Docs](https://nextjs.org/docs)
