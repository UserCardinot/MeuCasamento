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
