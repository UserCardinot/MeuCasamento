import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Presenca } from "@/db/schema";

const { presencas, convidados } = schema;

export async function getPresenca(convidadoId: number): Promise<Presenca | null> {
  const row = await getDb().query.presencas.findFirst({
    where: eq(presencas.convidadoId, convidadoId),
  });
  return row ?? null;
}

export async function upsertPresenca(
  eventoId: number,
  convidadoId: number,
  campos: { confirmado: boolean; mensagem: string; nomesAcompanhantes: string }
): Promise<"created" | "updated"> {
  const existente = await getPresenca(convidadoId);
  const db = getDb();
  if (existente) {
    await db
      .update(presencas)
      .set({ ...campos, atualizadoEm: new Date() })
      .where(eq(presencas.id, existente.id));
    return "updated";
  }
  await db.insert(presencas).values({ eventoId, convidadoId, ...campos });
  return "created";
}

export async function listarPresencas(eventoId: number) {
  return getDb()
    .select({
      token: convidados.token,
      nome: convidados.nome,
      confirmado: presencas.confirmado,
      mensagem: presencas.mensagem,
      nomesAcompanhantes: presencas.nomesAcompanhantes,
      atualizadoEm: presencas.atualizadoEm,
    })
    .from(presencas)
    .innerJoin(convidados, eq(convidados.id, presencas.convidadoId))
    .where(eq(presencas.eventoId, eventoId))
    .orderBy(desc(presencas.atualizadoEm));
}
