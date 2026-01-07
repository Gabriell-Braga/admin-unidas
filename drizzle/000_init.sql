-- 000_init.sql
-- Initial migration: create users and forms tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdBy TEXT,
  createdByName TEXT,
  createdAt TEXT,
  status TEXT
);
