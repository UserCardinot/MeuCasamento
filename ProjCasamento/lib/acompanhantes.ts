/** Separa nomes de acompanhantes (vírgula ou ponto e vírgula). */
export function parseAcompanhantesLista(raw: string): string[] {
  return (raw || "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatAcompanhantesLista(lista: string[]): string {
  return lista.join(", ");
}

/** União sem duplicar (case-insensitive). */
export function unirAcompanhantes(...listas: string[][]): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const lista of listas) {
    for (const nome of lista) {
      const chave = nome.trim().toLowerCase();
      if (!chave || vistos.has(chave)) continue;
      vistos.add(chave);
      out.push(nome.trim());
    }
  }
  return out;
}
