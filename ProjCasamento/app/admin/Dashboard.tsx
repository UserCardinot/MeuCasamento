"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddConvidado from "./AddConvidado";
import EnvioEmLote from "./EnvioEmLote";
import AddPresente from "./AddPresente";

type DadosAdmin = {
  convidados: { token: string; nome: string; acompanhantes: string; contato: string; data: string; link: string }[];
  presencas: { token: string; nome?: string; confirmado: string; telefone: string; mensagem?: string; nomesAcompanhantes?: string; data: string }[];
  presentes: { token: string; nome?: string; presente: string; valor: string; data: string }[];
  uploads: { tipo: string; nome: string; arquivo: string; data: string }[];
  recados?: { token: string; nome: string; mensagem: string; data: string }[];
  catalogoPresentes?: { nome: string; preco: string; url: string; imagem: string; ativo: string }[];
  resumo: { totalConvidados: number; totalPresencas: number; totalPresentes: number; totalUploads: number; totalRecados?: number };
};

export default function Dashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [buscaConvidados, setBuscaConvidados] = useState("");
  const [filtroPresenca, setFiltroPresenca] = useState<"todos" | "sim" | "nao">("todos");

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/listar-dados-admin");
      if (res.status === 401) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        setDados(null);
        return;
      }
      const json = await res.json();
      if (!json || !Array.isArray(json.convidados)) {
        setDados(null);
        return;
      }
      setDados(json);
    } catch {
      setDados(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 sm:px-12 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600">Carregando...</p>
      </main>
    );
  }

  if (!dados) {
    return (
      <main className="min-h-screen px-6 sm:px-12 py-24 bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-2xl border border-casamento-sage/50 shadow-sm p-8">
          <p className="text-red-600">Erro ao carregar dados. Verifique a conexão com o Google (refresh token) e tente novamente.</p>
          <button
            type="button"
            onClick={() => { setLoading(true); carregar(); }}
            className="mt-4 px-8 py-4 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva/90 transition shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  const convidados = dados.convidados ?? [];
  const presencas = dados.presencas ?? [];
  const uploads = dados.uploads ?? [];
  const resumo = dados.resumo ?? { totalConvidados: 0, totalPresencas: 0, totalPresentes: 0, totalUploads: 0 };

  const convidadosFiltrados = convidados.filter(
    (c) =>
      !buscaConvidados ||
      c.nome.toLowerCase().includes(buscaConvidados.toLowerCase()) ||
      c.acompanhantes.toLowerCase().includes(buscaConvidados.toLowerCase())
  );

  const presencasFiltradas = presencas.filter((p) => {
    if (filtroPresenca === "todos") return true;
    const conf = String(p.confirmado).toLowerCase();
    if (filtroPresenca === "sim") return conf.includes("sim");
    return conf.includes("não") || conf.includes("nao");
  });

  function exportarCSV(tipo: "convidados" | "presencas") {
    const BOM = "\uFEFF";
    let csv = "";
    if (tipo === "convidados") {
      csv = "Nome;Acompanhantes;Contato;Link\n" + convidadosFiltrados.map((c) => `${c.nome};${c.acompanhantes};${c.contato};${c.link}`).join("\n");
    } else {
      csv = "Nome;Confirmado;Telefone;Acompanhantes;Mensagem;Data\n" + presencasFiltradas.map((p) => `${p.nome ?? p.token};${p.confirmado};${p.telefone};${p.nomesAcompanhantes ?? ""};${(p.mensagem ?? "").replace(/;/g, ",")};${p.data}`).join("\n");
    }
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tipo}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fotos = uploads.filter((u) => u.tipo === "foto");
  function extrairFileId(url: string): string | null {
    const m = url.match(/\/file\/d\/([^/]+)/);
    return m ? m[1] : null;
  }

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-stone-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-600 hover:text-stone-800 font-medium focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 rounded px-3 py-1"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-casamento-sage/50 shadow-sm">
            <p className="text-2xl font-bold text-casamento-oliva-escuro">{resumo.totalConvidados}</p>
            <p className="text-sm text-stone-600">Convidados</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-casamento-sage/50 shadow-sm">
            <p className="text-2xl font-bold text-casamento-oliva-escuro">{resumo.totalPresencas}</p>
            <p className="text-sm text-stone-600">Presenças</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-casamento-sage/50 shadow-sm">
            <p className="text-2xl font-bold text-casamento-oliva-escuro">{resumo.totalPresentes}</p>
            <p className="text-sm text-stone-600">Presentes</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-casamento-sage/50 shadow-sm">
            <p className="text-2xl font-bold text-casamento-oliva-escuro">{resumo.totalUploads}</p>
            <p className="text-sm text-stone-600">Uploads</p>
          </div>
        </div>

        <AddConvidado onAdicionado={carregar} />
        <EnvioEmLote onAdicionados={carregar} />

        <section className="mt-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Convidados e Links</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={buscaConvidados}
                onChange={(e) => setBuscaConvidados(e.target.value)}
                className="px-3 py-1.5 text-sm border border-stone-300 rounded-xl"
              />
              <button
                onClick={() => exportarCSV("convidados")}
                className="text-sm text-casamento-oliva-escuro hover:underline"
              >
                Exportar CSV
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Acompanhantes</th>
                  <th className="text-left p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {convidadosFiltrados.map((c) => (
                  <tr key={c.token} className="border-b border-stone-100">
                    <td className="p-3">{c.nome}</td>
                    <td className="p-3">{c.acompanhantes}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(c.link)}
                        className="text-casamento-oliva-escuro hover:underline"
                      >
                        Copiar
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent("Confirmação de presença - Lucas & Beatriz: " + c.link)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-casamento-oliva-escuro hover:underline"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Presenças</h2>
            <div className="flex gap-2">
              <select
                value={filtroPresenca}
                onChange={(e) => setFiltroPresenca(e.target.value as "todos" | "sim" | "nao")}
                className="px-3 py-1.5 text-sm border border-stone-300 rounded-xl"
              >
                <option value="todos">Todos</option>
                <option value="sim">Confirmados</option>
                <option value="nao">Não confirmados</option>
              </select>
              <button
                onClick={() => exportarCSV("presencas")}
                className="text-sm text-casamento-oliva-escuro hover:underline"
              >
                Exportar CSV
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Confirmado</th>
                  <th className="text-left p-3">Telefone</th>
                  <th className="text-left p-3">Acompanhantes</th>
                  <th className="text-left p-3">Mensagem</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {presencasFiltradas.map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{p.nome ?? p.token}</td>
                    <td className="p-3">{p.confirmado}</td>
                    <td className="p-3">{p.telefone}</td>
                    <td className="p-3">{p.nomesAcompanhantes || "-"}</td>
                    <td className="p-3 max-w-[200px] truncate" title={p.mensagem}>{p.mensagem || "-"}</td>
                    <td className="p-3">{p.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Catálogo de Presentes</h2>
          <AddPresente onAdicionado={carregar} />
          {dados.catalogoPresentes && dados.catalogoPresentes.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Preço</th>
                    <th className="text-left p-3">URL</th>
                    <th className="text-left p-3">Imagem</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.catalogoPresentes.map((p, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="p-3">{p.nome}</td>
                      <td className="p-3">{p.preco ? `R$ ${p.preco}` : "-"}</td>
                      <td className="p-3">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-casamento-oliva-escuro hover:underline truncate block max-w-[150px]">
                            Link
                          </a>
                        ) : "-"}
                      </td>
                      <td className="p-3">
                        {p.imagem ? (
                          <a href={p.imagem} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 rounded overflow-hidden border border-stone-200 hover:opacity-80">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <span className="text-stone-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Registros de Presentes (quem deu o quê)</h2>
          <div className="bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Presente</th>
                  <th className="text-left p-3">Valor</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {(dados.presentes ?? []).map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{p.nome ?? p.token}</td>
                    <td className="p-3">{p.presente}</td>
                    <td className="p-3">{p.valor ? `R$ ${p.valor}` : "-"}</td>
                    <td className="p-3">{p.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {fotos.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Galeria de Fotos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {fotos.map((u, i) => {
                const fileId = extrairFileId(u.arquivo);
                const thumbUrl = fileId
                  ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`
                  : null;
                return (
                  <a
                    key={i}
                    href={u.arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square rounded-lg overflow-hidden border border-stone-200 hover:opacity-90"
                  >
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbUrl} alt={u.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-500 text-xs">
                        Foto
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {dados.recados && dados.recados.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">Recados</h2>
            <div className="bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3">Mensagem</th>
                    <th className="text-left p-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.recados.map((r, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="p-3">{r.nome}</td>
                      <td className="p-3 max-w-[300px]">{r.mensagem}</td>
                      <td className="p-3">{r.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-8 mb-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Uploads (Fotos e Áudios)</h2>
          <div className="bg-white rounded-2xl border border-casamento-sage/50 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Link</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{u.tipo}</td>
                    <td className="p-3">{u.nome}</td>
                    <td className="p-3">
                      {u.arquivo?.startsWith("http") ? (
                        <a
                          href={u.arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-casamento-oliva-escuro hover:underline"
                        >
                          Abrir
                        </a>
                      ) : (
                        u.arquivo
                      )}
                    </td>
                    <td className="p-3">{u.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
