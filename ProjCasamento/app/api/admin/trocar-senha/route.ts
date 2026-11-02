import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { exigirAdmin } from "@/lib/admin-sessao";
import { hashSenha, verificarSenha } from "@/lib/senha";

export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

  let body: { senhaAtual?: string; novaSenha?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const novaSenha = body.novaSenha ?? "";
  if (novaSenha.length < 6) {
    return NextResponse.json({ erro: "A nova senha precisa ter pelo menos 6 caracteres." }, { status: 400 });
  }
  if (!verificarSenha(body.senhaAtual ?? "", admin.usuario.senhaHash)) {
    return NextResponse.json({ erro: "Senha atual incorreta." }, { status: 400 });
  }

  await getDb()
    .update(schema.usuarios)
    .set({ senhaHash: hashSenha(novaSenha), trocarSenha: false })
    .where(eq(schema.usuarios.id, admin.usuario.id));

  return NextResponse.json({ sucesso: true });
}
