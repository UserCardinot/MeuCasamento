import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { atualizarConvidado } from "@/lib/repo/convidados";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

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

  try {
    const ok = await atualizarConvidado(admin.evento.id, token, {
      nome,
      acompanhantes: body?.acompanhantes?.trim() || "",
      contato: body?.contato?.trim() || "",
      origem: body?.origem?.trim() || "",
    });
    if (!ok) {
      return NextResponse.json({ erro: "Convidado não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao editar convidado:", err);
    return NextResponse.json({ erro: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
