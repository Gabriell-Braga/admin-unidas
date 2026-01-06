import { getAllForms } from "@/src/lib/db";

export async function GET(request: Request) {
  try {
    const forms = await getAllForms();
    return Response.json({ forms });
  } catch (error) {
    console.error("Erro ao buscar formulários:", error);
    return Response.json(
      { error: "Erro ao buscar formulários" },
      { status: 500 }
    );
  }
}
