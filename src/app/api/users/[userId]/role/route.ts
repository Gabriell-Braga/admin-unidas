import { updateUser, getUserById } from "@/src/lib/db";
import { cookies } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json() as {
      role?: string;
      name?: string;
      status?: string;
    };

    if (!body.role && !body.name && !body.status) {
      return Response.json(
        {
          error:
            "Ao menos um campo (role, name ou status) é obrigatório",
        },
        { status: 400 }
      );
    }

    // Obter o usuário logado da sessão
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sessionToken")?.value;

    if (!sessionToken) {
      return Response.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Não permitir que um usuário edite a si mesmo
    if (userId === sessionToken) {
      return Response.json(
        { error: "Você não pode editar sua própria conta" },
        { status: 403 }
      );
    }

    // Não permitir edição do usuário admin
    const userBeingEdited = await getUserById(userId);
    if (!userBeingEdited) {
      return Response.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Não permitir edição do admin principal
    if (userBeingEdited.id === "admin-001-unidas") {
      return Response.json(
        { error: "Não é permitido editar o administrador principal" },
        { status: 403 }
      );
    }

    await updateUser(userId, body);
    return Response.json({
      success: true,
      message: "Usuário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return Response.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
