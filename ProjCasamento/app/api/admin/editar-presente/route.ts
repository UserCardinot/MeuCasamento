import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { atualizarPresente } from "@/lib/repo/catalogo";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

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

  try {
    const result = await atualizarPresente(admin.evento.id, nomeOriginal, {
      nome,
      preco: body?.preco?.trim() || "",
      url: body?.url?.trim() || "",
      imagem: body?.imagem?.trim() || "",
      ativo: (body?.ativo?.trim() || "Sim").toLowerCase().startsWith("s"),
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
    return NextResponse.json({ erro: "Erro ao salvar. Tente novamente." }, { status: 500 });
  }
}
