import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteCatalogoPresenteRow } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session || !validateAdminSessionToken(session)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: { nomeOriginal?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const nomeOriginal = body?.nomeOriginal?.trim();
  if (!nomeOriginal) {
    return NextResponse.json({ erro: "Presente não identificado" }, { status: 400 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const result = await deleteCatalogoPresenteRow(sheetId, nomeOriginal);
    if (result === "not_found") {
      return NextResponse.json({ erro: "Presente não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao remover presente:", err);
    return NextResponse.json({ erro: "Erro ao excluir na planilha. Tente novamente." }, { status: 500 });
  }
}
