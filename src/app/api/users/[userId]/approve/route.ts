import { NextRequest, NextResponse } from "next/server";
import { updateUserStatus } from "@/src/lib/db";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Atualizar status do usuário para 'active'
    await updateUserStatus(userId, "active");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao aprovar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
