/**
 * Uso:
 *   npx tsx scripts/criar-usuario.ts --login ana --evento convite-ediane [--nome "Ana"] [--senha xyz] [--papel admin|super]
 * Se o login já existir, redefine a senha (e força troca no próximo acesso).
 */
import "dotenv/config";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../db";
import { hashSenha } from "../lib/senha";

function arg(nome: string): string | undefined {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const login = arg("login")?.trim().toLowerCase();
  const papel = arg("papel") === "super" ? "super" : "admin";
  const slug = arg("evento")?.trim();
  const nome = arg("nome")?.trim() || login || "";
  const senha = arg("senha")?.trim() || randomBytes(6).toString("base64url");

  if (!login) throw new Error("Informe --login");
  if (papel === "admin" && !slug) throw new Error("Informe --evento <slug> para admin de evento");

  const db = getDb();
  let eventoId: number | null = null;
  if (slug) {
    const ev = await db.query.eventos.findFirst({ where: eq(schema.eventos.slug, slug) });
    if (!ev) throw new Error(`Evento não encontrado: ${slug}`);
    eventoId = ev.id;
  }

  const existente = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.login, login) });
  if (existente) {
    await db
      .update(schema.usuarios)
      .set({ senhaHash: hashSenha(senha), trocarSenha: true, eventoId, papel, nome })
      .where(eq(schema.usuarios.id, existente.id));
    console.log(`Senha redefinida: login=${login} senha=${senha}`);
  } else {
    await db.insert(schema.usuarios).values({
      login,
      nome,
      senhaHash: hashSenha(senha),
      papel,
      eventoId,
      trocarSenha: true,
    });
    console.log(`Usuário criado: login=${login} senha=${senha} evento=${slug ?? "(todos)"}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
