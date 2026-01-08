#!/usr/bin/env node

/**
 * Script para criar um usuário admin no banco de dados
 * 
 * Uso:
 * npm run create-admin -- <email> <password> <name>
 * 
 * Exemplo:
 * npm run create-admin -- admin@example.com senha123 "Admin User"
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Uso: npm run create-admin -- <email> <password> <name>');
  console.error('Exemplo: npm run create-admin -- admin@example.com senha123 "Admin User"');
  process.exit(1);
}

const [email, password, name] = args;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const mockPath = path.join(process.cwd(), '.mockdb.json');

async function createAdmin() {
  try {
    console.log('Criando usuário admin (mock)...');

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    let mock = { users: [] };
    try {
      if (fs.existsSync(mockPath)) {
        mock = JSON.parse(fs.readFileSync(mockPath, 'utf-8')) || mock;
      }
    } catch (e) {
      console.warn('Não foi possível ler .mockdb.json, criando novo.');
    }

    if (mock.users.find((u) => u.email === email)) {
      console.log('Usuário já existe no mock db:', email);
      process.exit(0);
    }

    mock.users.push({ id: userId, email, name, password_hash: passwordHash, role: 'admin', status: 'active' });

    fs.writeFileSync(mockPath, JSON.stringify(mock, null, 2));

    console.log('✓ Usuário admin criado com sucesso (mock)!');
    console.log(`  Email: ${email}`);
    console.log(`  Nome: ${name}`);
    console.log(`  ID: ${userId}`);
  } catch (error) {
    console.error('✗ Erro ao criar usuário admin (mock):', error);
    process.exit(1);
  }
}

createAdmin();
