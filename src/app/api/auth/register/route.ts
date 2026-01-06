import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios" },
        { status: 400 }
      );
    }

    if (!email.endsWith("@unidas.com.br")) {
      return NextResponse.json(
        { error: "Use um email com domínio @unidas.com.br" },
        { status: 400 }
      );
    }

    const result = await registerUser(email, name, password);

    if (result.error) {
      console.error("Erro no registro:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro ao registrar usuário: " + String(error) },
      { status: 500 }
    );
  }
}
