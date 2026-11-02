import "dotenv/config";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../db";
import { hashSenha } from "../lib/senha";

const EVENTOS_INICIAIS: (typeof schema.eventos.$inferInsert)[] = [
  {
    slug: "convite-henry",
    dominio: "convite-henry.lumenemotion.com.br",
    tipo: "convite_completo",
    tema: "mickey",
    titulo: "Aniversário de 2 anos do Henry",
    anfitrioes: "Henry",
    mensagemConvite: "Venha comemorar comigo o meu aniversário de 2 anos!",
    whatsappTemplate:
      "Oi, {nome}! 🎈\n\nVocê está convidado(a) para o *{titulo}* — {data}.\n\nAbra seu convite aqui:\n{link}",
  },
  {
    slug: "convite-ediane",
    dominio: "convite-ediane.lumenemotion.com.br",
    tipo: "so_presentes",
    tema: "oliva",
    titulo: "Casamento",
    anfitrioes: "Ediane",
    textoCapa: "Confirme sua presença, escolha um presente e deixe seu recado para os noivos.",
    whatsappTemplate:
      "Olá, {nome}! 💚\n\nFicaremos muito felizes com sua presença no nosso *{titulo}* — {data}.\n\nConfirme sua presença, veja a lista de presentes e deixe um recado:\n{link}",
  },
];

async function main() {
  const db = getDb();

  for (const ev of EVENTOS_INICIAIS) {
    const existente = await db.query.eventos.findFirst({ where: eq(schema.eventos.slug, ev.slug) });
    if (existente) {
      console.log(`Evento já existe: ${ev.slug} (id ${existente.id})`);
      continue;
    }
    const [novo] = await db.insert(schema.eventos).values(ev).returning();
    console.log(`Evento criado: ${novo.slug} (id ${novo.id})`);
  }

  const login = (process.env.SUPER_ADMIN_LOGIN || "lucas").trim().toLowerCase();
  const existente = await db.query.usuarios.findFirst({ where: eq(schema.usuarios.login, login) });
  if (existente) {
    console.log(`Super admin já existe: ${login}`);
  } else {
    const senha = process.env.SUPER_ADMIN_SENHA?.trim() || randomBytes(6).toString("base64url");
    await db.insert(schema.usuarios).values({
      login,
      nome: "Lucas",
      senhaHash: hashSenha(senha),
      papel: "super",
      eventoId: null,
      trocarSenha: !process.env.SUPER_ADMIN_SENHA,
    });
    console.log(`Super admin criado: login=${login} senha=${senha}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
