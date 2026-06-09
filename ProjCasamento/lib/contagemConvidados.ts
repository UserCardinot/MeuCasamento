/**
 * Conta pessoas de um convite: 1 titular (nome) + cada nome em acompanhantes
 * separados por vírgula ou ponto e vírgula (ex.: "Maria, Pedro, Tiago").
 */
export function contarPessoasNoConvite(nome: string, acompanhantes: string): number {
  const titular = nome.trim() ? 1 : 0;
  const extras = (acompanhantes || "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  return titular + extras;
}

export function totalPessoasConvidadas(
  convidados: { nome: string; acompanhantes: string }[]
): number {
  return convidados.reduce((sum, c) => sum + contarPessoasNoConvite(c.nome, c.acompanhantes), 0);
}

type PresencaContagem = {
  nome?: string;
  confirmado: string;
  nomesAcompanhantes?: string;
};

function presencaConfirmada(confirmado: string): boolean {
  return String(confirmado).toLowerCase().includes("sim");
}

/** Titular + acompanhantes (vírgula ou ;) quando a presença está confirmada. */
export function contarPessoasConfirmadas(presenca: PresencaContagem): number {
  if (!presencaConfirmada(presenca.confirmado)) return 0;
  return contarPessoasNoConvite(presenca.nome ?? "", presenca.nomesAcompanhantes ?? "");
}

export function totalPessoasConfirmadas(presencas: PresencaContagem[]): number {
  return presencas.reduce((sum, p) => sum + contarPessoasConfirmadas(p), 0);
}
