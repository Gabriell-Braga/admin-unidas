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

import { hashPassword } from './lib/auth.js';
import { db } from './lib/db.js';
import crypto from 'crypto';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Uso: npm run create-admin -- <email> <password> <name>');
  console.error('Exemplo: npm run create-admin -- admin@example.com senha123 "Admin User"');
  process.exit(1);
}

const [email, password, name] = args;

async function createAdmin() {
  try {
    console.log('Criando usuário admin...');
    
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    
    await db
      .prepare(
        'INSERT INTO users (id, email, name, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(userId, email, name, passwordHash, 'admin', 'active')
      .run();
    
    console.log('✓ Usuário admin criado com sucesso!');
    console.log(`  Email: ${email}`);
    console.log(`  Nome: ${name}`);
    console.log(`  ID: ${userId}`);
  } catch (error) {
    console.error('✗ Erro ao criar usuário admin:', error);
    process.exit(1);
  }
}

createAdmin();
