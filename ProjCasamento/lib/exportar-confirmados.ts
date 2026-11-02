/** Exportação da lista de confirmados no navegador (painel admin). */

export type LinhaConfirmado = {
  nome: string;
  grupo: string;
  acompanhantes: string;
  pessoas: number;
  data: string;
};

function nomeArquivo(titulo: string, ext: string): string {
  const base = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `confirmados-${base || "evento"}-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

function baixar(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

/** CSV com `;` e BOM: abre direto no Excel em português com acentos corretos. */
export function exportarConfirmadosExcel(linhas: LinhaConfirmado[], titulo: string) {
  const cel = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const total = linhas.reduce((s, l) => s + l.pessoas, 0);
  const csv = [
    ["Nome", "Grupo", "Acompanhantes", "Pessoas", "Respondeu em"].map(cel).join(";"),
    ...linhas.map((l) => [l.nome, l.grupo, l.acompanhantes, l.pessoas, l.data].map(cel).join(";")),
    "",
    [cel("Total de pessoas"), "", "", cel(total), ""].join(";"),
  ].join("\r\n");
  baixar(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), nomeArquivo(titulo, "csv"));
}

export async function exportarConfirmadosPDF(linhas: LinhaConfirmado[], titulo: string) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const total = linhas.reduce((s, l) => s + l.pessoas, 0);

  doc.setFontSize(16);
  doc.text(`Lista de confirmados${titulo ? ` — ${titulo}` : ""}`, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    `${linhas.length} convite(s) confirmado(s) · ${total} pessoa(s) no total · gerado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    14,
    23
  );

  autoTable(doc, {
    startY: 28,
    head: [["#", "Nome", "Grupo", "Acompanhantes", "Pessoas", "Respondeu em"]],
    body: linhas.map((l, i) => [i + 1, l.nome, l.grupo || "—", l.acompanhantes || "—", l.pessoas, l.data]),
    foot: [["", "Total", "", "", total, ""]],
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [40, 40, 40] },
    footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 10 }, 4: { halign: "center", cellWidth: 20 } },
  });

  doc.save(nomeArquivo(titulo, "pdf"));
}
