import { getAllUsers } from "@/src/lib/db";

export async function GET(request: Request) {
  try {
    const users = await getAllUsers();
    return Response.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return Response.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
