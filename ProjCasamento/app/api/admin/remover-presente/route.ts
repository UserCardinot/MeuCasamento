import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { removerPresente } from "@/lib/repo/catalogo";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

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

  try {
    const ok = await removerPresente(admin.evento.id, nomeOriginal);
    if (!ok) {
      return NextResponse.json({ erro: "Presente não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao remover presente:", err);
    return NextResponse.json({ erro: "Erro ao excluir. Tente novamente." }, { status: 500 });
  }
}
