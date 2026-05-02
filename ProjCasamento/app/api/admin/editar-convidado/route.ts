import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateConvidadoRow } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session || !validateAdminSessionToken(session)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: {
    token?: string;
    nome?: string;
    acompanhantes?: string;
    contato?: string;
    origem?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const token = body?.token?.trim();
  const nome = body?.nome?.trim();
  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }
  if (!nome) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const result = await updateConvidadoRow(sheetId, token, {
      nome,
      acompanhantes: body?.acompanhantes?.trim() || "",
      contato: body?.contato?.trim() || "",
      origem: body?.origem?.trim() || "",
    });
    if (result === "not_found") {
      return NextResponse.json({ erro: "Convidado não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao editar convidado:", err);
    return NextResponse.json(
      { erro: "Erro ao salvar na planilha. Tente novamente." },
      { status: 500 }
    );
  }
}
