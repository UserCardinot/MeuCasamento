import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { criarPresente } from "@/lib/repo/catalogo";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

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

  try {
    const result = await criarPresente(admin.evento.id, {
      nome,
      preco: typeof body.preco === "string" ? body.preco.trim() : "",
      url: typeof body.url === "string" ? body.url.trim() : "",
      imagem: typeof body.imagem === "string" ? body.imagem.trim() : "",
      ativo: true,
    });
    if (result === "duplicate_nome") {
      return NextResponse.json({ erro: "Já existe um presente com esse nome." }, { status: 409 });
    }
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao adicionar presente:", err);
    return NextResponse.json({ erro: "Erro ao salvar" }, { status: 500 });
  }
}
