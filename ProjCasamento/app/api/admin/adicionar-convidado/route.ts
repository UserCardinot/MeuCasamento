import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { baseUrlDoEvento } from "@/lib/evento-atual";
import { criarConvidado } from "@/lib/repo/convidados";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

  let body: { nome?: string; acompanhantes?: string; contato?: string; origem?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const nome = body?.nome?.trim();
  if (!nome) {
    return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 });
  }

  try {
    const convidado = await criarConvidado(admin.evento.id, {
      nome,
      acompanhantes: body?.acompanhantes?.trim() || "",
      contato: body?.contato?.trim() || "",
      origem: body?.origem?.trim() || "",
    });
    const link = `${baseUrlDoEvento(admin.evento)}/convite?token=${convidado.token}`;
    return NextResponse.json({ sucesso: true, token: convidado.token, link });
  } catch (err) {
    console.error("Erro ao adicionar convidado:", err);
    return NextResponse.json({ erro: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
