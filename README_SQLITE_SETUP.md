# SQLite / Webflow Cloud Setup (local + deploy notes)

Resumo rápido:

- Local dev: o projeto agora usa `sql.js` (WASM) e persiste em `data/db.sqlite` automaticamente.
- Deploy no Webflow Cloud: Webflow cria o SQLite e aplica migrations encontradas na pasta `drizzle`.

Passos locais recomendados:

1. Instalar dependências:

```bash
npm install
```

2. Rodar o app localmente:

```bash
npm run dev
```

3. O arquivo local do DB fica em `data/db.sqlite`.

Gerar e aplicar migrations (opcional / local):

- Se quiser usar as ferramentas `drizzle-kit` e `wrangler d1` localmente, instale-as como dev dependencies e gere as migrations:

```bash
npm i -D drizzle-kit
npm run db:generate
# aplicar localmente (requer wrangler)
npm run db:apply:local
```

Deploy para Webflow Cloud:

1. Commit/push do repositório com a pasta `drizzle` contendo as migrations.
2. `webflow cloud deploy` (ou push para GitHub se você tem CI configurado).
3. Ao deploy, o Webflow criará um binding `DB` para seu ambiente e aplicará as migrations.

Notas técnicas:

- Em produção (Webflow Cloud) seu código deve ler o binding D1 através do `env.DB`/binding do runtime. O `src/lib/db.ts` agora verifica `process.env.DB` e `globalThis.DB` antes de usar o fallback `sql.js`.
- Não use `better-sqlite3` no deploy do Webflow Cloud — ele não funciona em Workers.

Se quiser, eu posso:
- Gerar migrations com `drizzle-kit` aqui (instalar `drizzle-kit` localmente), ou
- Atualizar `README.md` principal com estas instruções.
