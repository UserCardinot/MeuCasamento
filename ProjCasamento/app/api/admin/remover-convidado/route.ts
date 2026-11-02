import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { removerConvidado } from "@/lib/repo/convidados";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const token = body?.token?.trim();
  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  try {
    const ok = await removerConvidado(admin.evento.id, token);
    if (!ok) {
      return NextResponse.json({ erro: "Convidado não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao remover convidado:", err);
    return NextResponse.json({ erro: "Erro ao excluir. Tente novamente." }, { status: 500 });
  }
}
