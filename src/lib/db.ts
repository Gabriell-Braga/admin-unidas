// lib/db.ts
import { D1Database } from "@cloudflare/workers-types";
import { cookies } from "next/headers";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// SQL fallback: will lazy-load `sql.js` (WASM) only when needed
let db: any = null;

// Path to mock database file
const mockDbPath = path.join(process.cwd(), ".mockdb.json");

function loadMockDb() {
  try {
    if (fs.existsSync(mockDbPath)) {
      const data = fs.readFileSync(mockDbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao carregar mock db:", error);
  }
  return { users: [] };
}

function saveMockDb(data: any) {
  try {
    fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erro ao salvar mock db:", error);
  }
}

// Essa interface ajuda o TypeScript a entender que 'DB' existe no seu ambiente
export interface Env {
  DB: D1Database;
}

// No Webflow Cloud (ambiente Cloudflare), o banco fica em process.env.DB
// Aqui exportamos uma forma simples de acessá-lo
// Determine database: prefer Cloudflare D1 (process.env.DB), otherwise use SQLite file (sql.js), otherwise JSON mock
// Try multiple places for the Cloudflare D1 binding used by Webflow Cloud
const maybeDbFromGlobal = (globalThis as any)?.DB;
if (process.env.DB) {
  db = (process.env.DB as unknown as D1Database);
} else if (maybeDbFromGlobal) {
  db = maybeDbFromGlobal as D1Database;
} else {
  // Use sql.js + file persistence for local development (lazy-loaded)
  const dataDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.error("Erro ao criar pasta data:", e);
  }

  const sqlitePath = path.join(dataDir, "db.sqlite");

  let sqlDbInstancePromise: Promise<any> | null = null;

  async function initSqlJsAndDb() {
    if (sqlDbInstancePromise) return sqlDbInstancePromise;
    sqlDbInstancePromise = (async () => {
      const sqljs = await import("sql.js");
      const init = sqljs.default || sqljs;
      const SQL = await init({ locateFile: (file: string) => file });

      let filebuffer: Uint8Array | undefined;
      try {
        if (fs.existsSync(sqlitePath)) {
          filebuffer = fs.readFileSync(sqlitePath);
        }
      } catch (e) {
        console.error("Erro ao ler arquivo sqlite:", e);
      }

      const sqlDb = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database();

      const persist = () => {
        try {
          const data = sqlDb.export();
          fs.writeFileSync(sqlitePath, Buffer.from(data));
        } catch (e) {
          console.error("Erro ao persistir sqlite:", e);
        }
      };

      function createWrapperDb(sqlDbInstance: any) {
        return {
          prepare(sql: string) {
            return {
              bind: (...params: any[]) => ({
                run: async () => {
                  const stmt = sqlDbInstance.prepare(sql);
                  try {
                    stmt.bind(params);
                    stmt.step();
                    const res = stmt.getAsObject();
                    stmt.free();
                    persist();
                    return { success: true, lastRowId: undefined, changes: 1, result: res };
                  } finally {
                    try { stmt.free(); } catch {}
                  }
                },
                all: async () => {
                  const stmt = sqlDbInstance.prepare(sql);
                  const rows: any[] = [];
                  try {
                    while (stmt.step()) rows.push(stmt.getAsObject());
                    return { results: rows };
                  } finally {
                    try { stmt.free(); } catch {}
                  }
                },
                first: async () => {
                  const stmt = sqlDbInstance.prepare(sql);
                  try {
                    if (stmt.step()) return stmt.getAsObject();
                    return null;
                  } finally {
                    try { stmt.free(); } catch {}
                  }
                }
              }),
              run: async (...params: any[]) => {
                try {
                  const res = sqlDbInstance.exec(sql);
                  persist();
                  return { success: true, lastRowId: undefined, changes: res && res[0] ? res[0].values.length : 0 };
                } catch (e) {
                  throw e;
                }
              },
              all: async (...params: any[]) => {
                try {
                  const res = sqlDbInstance.exec(sql);
                  const rows = (res[0] && res[0].values) ? res[0].values.map((vals: any[]) => {
                    const cols = res[0].columns;
                    const obj: any = {};
                    cols.forEach((c: string, i: number) => obj[c] = vals[i]);
                    return obj;
                  }) : [];
                  return { results: rows };
                } catch (e) {
                  throw e;
                }
              },
              first: async (...params: any[]) => {
                try {
                  const res = sqlDbInstance.exec(sql);
                  if (res[0] && res[0].values && res[0].values.length > 0) {
                    const cols = res[0].columns;
                    const vals = res[0].values[0];
                    const obj: any = {};
                    cols.forEach((c: string, i: number) => obj[c] = vals[i]);
                    return obj;
                  }
                  return null;
                } catch (e) {
                  throw e;
                }
              }
            };
          }
        };
      }

      return createWrapperDb(sqlDb);
    })();
    return sqlDbInstancePromise;
  }

  // db proxy that forwards to real wrapper once initialized
  db = {
    prepare(sql: string) {
      return {
        bind: (...params: any[]) => {
          const promise = initSqlJsAndDb().then((r: any) => r.prepare(sql).bind(...params));
          return {
            run: () => promise.then((p: any) => p.run()),
            all: () => promise.then((p: any) => p.all()),
            first: () => promise.then((p: any) => p.first())
          };
        }
      };
    }
  };

  console.log("sql.js fallback ativo (WASM) em:", sqlitePath);
}

export { db };

// Função para obter sessão do usuário a partir dos cookies
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;
    
    if (!sessionToken) {
      return null;
    }

    // Aqui você pode validar o token (JWT ou similar)
    // Por enquanto, retornamos o token como sessão
    return { sessionToken };
  } catch (error) {
    console.error("Erro ao obter sessão:", error);
    return null;
  }
}

// Função para criar usuário
export async function createUser(
  email: string,
  name: string,
  passwordHash: string,
  role: string = "user"
) {
  try {
    const id = crypto.randomUUID();
    
    // Use real DB if available, otherwise use mock
    if (db) {
      const result = await db
        .prepare(
          "INSERT INTO users (id, email, name, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(id, email, name, passwordHash, role, "pending")
        .run();
      return { success: true, id };
    } else {
      // Mock storage for development - use JSON file
      const mockDb = loadMockDb();
      mockDb.users.push({ id, email, name, password_hash: passwordHash, role, status: "pending" });
      saveMockDb(mockDb);
      console.log("Usuário criado:", { id, email });
      return { success: true, id };
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}

// Função para obter usuário por email
export async function getUserByEmail(email: string) {
  try {
    if (db) {
      const user = await db
        .prepare("SELECT * FROM users WHERE email = ?")
        .bind(email)
        .first();
      return user;
    } else {
      // Mock query - use JSON file
      const mockDb = loadMockDb();
      const user = mockDb.users.find((u: any) => u.email === email);
      console.log("Buscando usuário:", email, "- Encontrado:", !!user);
      return user || null;
    }
  } catch (error) {
    console.error("Erro ao obter usuário:", error);
    return null;
  }
}

// Função para obter usuários com status específico
export async function getUsersByStatus(status: string) {
  try {
    if (db) {
      const users = await db
        .prepare("SELECT id, name, email, status, role FROM users WHERE status = ?")
        .bind(status)
        .all();
      return users.results || [];
    } else {
      // Mock query - use JSON file
      const mockDb = loadMockDb();
      return mockDb.users.filter((u: any) => u.status === status);
    }
  } catch (error) {
    console.error("Erro ao obter usuários por status:", error);
    return [];
  }
}

// Função para atualizar status do usuário
export async function updateUserStatus(userId: string, status: string) {
  try {
    if (db) {
      await db
        .prepare("UPDATE users SET status = ? WHERE id = ?")
        .bind(status, userId)
        .run();
    } else {
      // Mock update - use JSON file
      const mockDb = loadMockDb();
      const user = mockDb.users.find((u: any) => u.id === userId);
      if (user) {
        user.status = status;
        saveMockDb(mockDb);
        console.log("Usuário atualizado:", userId, "- Status:", status);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    throw error;
  }
}

// Função para obter usuário por ID
export async function getUserById(userId: string) {
  try {
    if (db) {
      const user = await db
        .prepare("SELECT id, name, email, status, role FROM users WHERE id = ?")
        .bind(userId)
        .first();
      return user;
    } else {
      // Mock query - use JSON file
      const mockDb = loadMockDb();
      const user = mockDb.users.find((u: any) => u.id === userId);
      return user || null;
    }
  } catch (error) {
    console.error("Erro ao obter usuário por ID:", error);
    return null;
  }
}

// Função para obter todos os usuários
export async function getAllUsers() {
  try {
    if (db) {
      const users = await db
        .prepare("SELECT id, name, email, status, role FROM users")
        .all();
      return users.results || [];
    } else {
      // Mock query - use JSON file
      const mockDb = loadMockDb();
      return mockDb.users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        status: u.status,
        role: u.role
      }));
    }
  } catch (error) {
    console.error("Erro ao obter usuários:", error);
    return [];
  }
}

// Função para atualizar cargo do usuário
export async function updateUserRole(userId: string, role: string) {
  try {
    if (db) {
      await db
        .prepare("UPDATE users SET role = ? WHERE id = ?")
        .bind(role, userId)
        .run();
    } else {
      // Mock update - use JSON file
      const mockDb = loadMockDb();
      const user = mockDb.users.find((u: any) => u.id === userId);
      if (user) {
        user.role = role;
        saveMockDb(mockDb);
        console.log("Cargo do usuário atualizado:", userId, "- Role:", role);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar cargo do usuário:", error);
    throw error;
  }
}

// Função para atualizar múltiplos campos do usuário
export async function updateUser(
  userId: string,
  updates: { name?: string; role?: string; status?: string }
) {
  try {
    if (db) {
      const fields = [];
      const values = [];

      if (updates.name) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.role) {
        fields.push("role = ?");
        values.push(updates.role);
      }
      if (updates.status) {
        fields.push("status = ?");
        values.push(updates.status);
      }

      if (fields.length === 0) return { success: true };

      const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
      values.push(userId);

      await db.prepare(query).bind(...values).run();
    } else {
      // Mock update - use JSON file
      const mockDb = loadMockDb();
      const user = mockDb.users.find((u: any) => u.id === userId);
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.role) user.role = updates.role;
        if (updates.status) user.status = updates.status;
        saveMockDb(mockDb);
        console.log("Usuário atualizado:", userId, "-", updates);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

// Função para obter todos os formulários
export async function getAllForms() {
  try {
    if (db) {
      const forms = await db
        .prepare("SELECT id, name, createdBy, createdByName, createdAt, status FROM forms")
        .all();
      return forms.results || [];
    } else {
      // Mock query - use JSON file
      const mockDb = loadMockDb();
      return mockDb.forms || [];
    }
  } catch (error) {
    console.error("Erro ao obter formulários:", error);
    return [];
  }
}

// Função para atualizar formulário
export async function updateForm(formId: string, name: string) {
  try {
    if (db) {
      await db
        .prepare("UPDATE forms SET name = ? WHERE id = ?")
        .bind(name, formId)
        .run();
    } else {
      // Mock update - use JSON file
      const mockDb = loadMockDb();
      const form = mockDb.forms.find((f: any) => f.id === formId);
      if (form) {
        form.name = name;
        saveMockDb(mockDb);
        console.log("Formulário atualizado:", formId, "- Nome:", name);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error);
    throw error;
  }
}