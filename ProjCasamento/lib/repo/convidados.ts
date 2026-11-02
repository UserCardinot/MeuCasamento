import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Convidado } from "@/db/schema";
import { generateGuestToken } from "@/lib/auth";

const { convidados } = schema;

export type CamposConvidado = {
  nome: string;
  acompanhantes: string;
  contato: string;
  origem: string;
};

function normToken(token: string): string {
  return token.trim().toLowerCase();
}

export async function listarConvidados(eventoId: number): Promise<Convidado[]> {
  return getDb()
    .select()
    .from(convidados)
    .where(eq(convidados.eventoId, eventoId))
    .orderBy(asc(convidados.criadoEm), asc(convidados.id));
}

export async function getConvidado(eventoId: number, token: string): Promise<Convidado | null> {
  if (!token?.trim()) return null;
  const row = await getDb().query.convidados.findFirst({
    where: and(eq(convidados.eventoId, eventoId), eq(convidados.token, normToken(token))),
  });
  return row ?? null;
}

export async function criarConvidado(eventoId: number, campos: CamposConvidado): Promise<Convidado> {
  const [row] = await getDb()
    .insert(convidados)
    .values({ eventoId, token: generateGuestToken(), ...campos })
    .returning();
  return row;
}

export async function atualizarConvidado(
  eventoId: number,
  token: string,
  campos: Partial<CamposConvidado>
): Promise<boolean> {
  const rows = await getDb()
    .update(convidados)
    .set(campos)
    .where(and(eq(convidados.eventoId, eventoId), eq(convidados.token, normToken(token))))
    .returning({ id: convidados.id });
  return rows.length > 0;
}

export async function removerConvidado(eventoId: number, token: string): Promise<boolean> {
  const rows = await getDb()
    .delete(convidados)
    .where(and(eq(convidados.eventoId, eventoId), eq(convidados.token, normToken(token))))
    .returning({ id: convidados.id });
  return rows.length > 0;
}
