import crypto from "crypto";
import { db, getUserByEmail, createUser } from "./db";
import { cookies } from "next/headers";

// Gera hash da senha usando SHA256 (simples)
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Verifica se a senha está correta
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Gera JWT simples (para produção use uma biblioteca adequada)
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Login do usuário
export async function loginUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email) as any;

    if (!user) {
      return { error: "Usuário não encontrado" };
    }

    if (user.status === "pending") {
      return { error: "Seu acesso ainda não foi liberado por um administrador." };
    }

    if (user.status === "blocked") {
      return { error: "Sua conta foi bloqueada." };
    }

    if (!verifyPassword(password, user.password_hash as string)) {
      return { error: "Senha incorreta" };
    }

    // Criar sessão com dados do usuário
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();
    
    // Armazenar token na sessão (servidor faz validação)
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    // Armazenar dados do usuário em um cookie separado (para leitura no cliente)
    cookieStore.set("userData", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      } 
    };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return { error: "Erro ao fazer login" };
  }
}

// Register do usuário
export async function registerUser(
  email: string,
  name: string,
  password: string
) {
  try {
    // Verificar se usuário já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return { error: "Email já cadastrado" };
    }

    // Hash da senha
    const passwordHash = hashPassword(password);

    // Criar usuário usando função de DB que trata fallback
    await createUser(email, name, passwordHash, "user");

    return { 
      success: true, 
      message: "Cadastro realizado. Aguarde a aprovação de um administrador."
    };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return { error: "Erro ao registrar usuário: " + String(error) };
  }
}

// Logout do usuário
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("sessionToken");
    cookieStore.delete("userData");
    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    return { error: "Erro ao fazer logout" };
  }
}

// Obter usuário da sessão (para uso em rotas de API)
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get("userData")?.value;
    
    if (!userDataCookie) {
      return null;
    }

    return JSON.parse(userDataCookie);
  } catch (error) {
    console.error("Erro ao obter usuário da sessão:", error);
    return null;
  }
}
