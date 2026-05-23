import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateCatalogoPresenteRow } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session || !validateAdminSessionToken(session)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: {
    nomeOriginal?: string;
    nome?: string;
    preco?: string;
    url?: string;
    imagem?: string;
    ativo?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const nomeOriginal = body?.nomeOriginal?.trim();
  const nome = body?.nome?.trim();
  if (!nomeOriginal) {
    return NextResponse.json({ erro: "Presente não identificado" }, { status: 400 });
  }
  if (!nome) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const result = await updateCatalogoPresenteRow(sheetId, nomeOriginal, {
      nome,
      preco: body?.preco?.trim() || "",
      url: body?.url?.trim() || "",
      imagem: body?.imagem?.trim() || "",
      ativo: body?.ativo?.trim() || "Sim",
    });
    if (result === "not_found") {
      return NextResponse.json({ erro: "Presente não encontrado" }, { status: 404 });
    }
    if (result === "duplicate_nome") {
      return NextResponse.json({ erro: "Já existe outro presente com esse nome." }, { status: 409 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao editar presente:", err);
    return NextResponse.json({ erro: "Erro ao salvar na planilha. Tente novamente." }, { status: 500 });
  }
}
