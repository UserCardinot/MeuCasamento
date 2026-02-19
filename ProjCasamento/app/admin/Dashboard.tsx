"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddConvidado from "./AddConvidado";

type DadosAdmin = {
  convidados: { token: string; nome: string; acompanhantes: string; contato: string; data: string; link: string }[];
  presencas: { token: string; confirmado: string; telefone: string; data: string }[];
  presentes: { token: string; presente: string; valor: string; data: string }[];
  uploads: { tipo: string; nome: string; arquivo: string; data: string }[];
  resumo: { totalConvidados: number; totalPresencas: number; totalPresentes: number; totalUploads: number };
};

export default function Dashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    try {
      const res = await fetch("/api/listar-dados-admin");
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const json = await res.json();
      setDados(json);
    } catch {
      setDados(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
        <p className="text-stone-600">Carregando...</p>
      </main>
    );
  }

  if (!dados) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
        <p className="text-red-600">Erro ao carregar dados.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-stone-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-600 hover:text-stone-800"
          >
            Sair
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-casamento-sage">
            <p className="text-2xl font-bold text-casamento-verde">{dados.resumo.totalConvidados}</p>
            <p className="text-sm text-stone-600">Convidados</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-casamento-sage">
            <p className="text-2xl font-bold text-casamento-verde">{dados.resumo.totalPresencas}</p>
            <p className="text-sm text-stone-600">Presenças</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-casamento-sage">
            <p className="text-2xl font-bold text-casamento-verde">{dados.resumo.totalPresentes}</p>
            <p className="text-sm text-stone-600">Presentes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-casamento-sage">
            <p className="text-2xl font-bold text-casamento-verde">{dados.resumo.totalUploads}</p>
            <p className="text-sm text-stone-600">Uploads</p>
          </div>
        </div>

        <AddConvidado onAdicionado={carregar} />

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Convidados e Links</h2>
          <div className="bg-white rounded-lg border border-casamento-sage overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Acompanhantes</th>
                  <th className="text-left p-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {dados.convidados.map((c) => (
                  <tr key={c.token} className="border-b border-stone-100">
                    <td className="p-3">{c.nome}</td>
                    <td className="p-3">{c.acompanhantes}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(c.link);
                        }}
                        className="text-casamento-verde hover:underline"
                      >
                        Copiar link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Presenças</h2>
          <div className="bg-white rounded-lg border border-casamento-sage overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Confirmado</th>
                  <th className="text-left p-3">Telefone</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.presencas.map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{p.confirmado}</td>
                    <td className="p-3">{p.telefone}</td>
                    <td className="p-3">{p.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Presentes</h2>
          <div className="bg-white rounded-lg border border-casamento-sage overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left p-3">Presente</th>
                  <th className="text-left p-3">Valor</th>
                  <th className="text-left p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.presentes.map((p, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{p.presente}</td>
                    <td className="p-3">{p.valor ? `R$ ${p.valor}` : "-"}</td>
                    <td className="p-3">{p.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 mb-12">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Uploads (Fotos e Áudios)</h2>
          <div className="bg-white rounded-lg border border-casamento-sage overflow-x-auto">
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
                {dados.uploads.map((u, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    <td className="p-3">{u.tipo}</td>
                    <td className="p-3">{u.nome}</td>
                    <td className="p-3">
                      {u.arquivo?.startsWith("http") ? (
                        <a
                          href={u.arquivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-casamento-verde hover:underline"
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
