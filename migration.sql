-- migration.sql

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
  status TEXT CHECK(status IN ('pending', 'active', 'blocked')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de formulários (relacionada ao usuário)
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSON NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);