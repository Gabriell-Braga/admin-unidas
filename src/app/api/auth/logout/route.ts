import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const result = await logoutUser();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro no logout:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
