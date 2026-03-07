import { NextRequest, NextResponse } from "next/server";
import { appendToSheet } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token || !validateAdminSessionToken(token)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: { nome?: string; preco?: string; url?: string; imagem?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }

  const preco = typeof body.preco === "string" ? body.preco.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const imagem = typeof body.imagem === "string" ? body.imagem.trim() : "";

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    await appendToSheet(sheetId, "CatalogoPresentes!A:E", [
      [nome, preco, url, imagem, "Sim"],
    ]);
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao adicionar presente:", err);
    return NextResponse.json({ erro: "Erro ao salvar" }, { status: 500 });
  }
}
