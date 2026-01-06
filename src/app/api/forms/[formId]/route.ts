import { updateForm } from "@/src/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json() as { name?: string };

    if (!body.name) {
      return Response.json(
        { error: "Nome do formulário é obrigatório" },
        { status: 400 }
      );
    }

    if (!body.name.trim()) {
      return Response.json(
        { error: "Nome do formulário não pode estar vazio" },
        { status: 400 }
      );
    }

    await updateForm(formId, body.name);
    return Response.json({
      success: true,
      message: "Formulário atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar formulário:", error);
    return Response.json(
      { error: "Erro ao atualizar formulário" },
      { status: 500 }
    );
  }
}
