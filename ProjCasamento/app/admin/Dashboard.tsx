"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import AddConvidado from "./AddConvidado";
import EnvioEmLote from "./EnvioEmLote";
import AddPresente from "./AddPresente";
import SincronizarPagamentoMP from "./SincronizarPagamentoMP";
import EditarConvidadoModal from "./EditarConvidadoModal";
import EditarPresenteModal from "./EditarPresenteModal";
import { contarPessoasNoConvite, totalPessoasConvidadas } from "@/lib/contagemConvidados";
import { buildConviteWhatsAppUrl } from "@/lib/convite-whatsapp";
import { matchBuscaCatalogoPresente } from "@/lib/presentes-checkout";

type DadosAdmin = {
  convidados: {
    token: string;
    nome: string;
    acompanhantes: string;
    contato: string;
    data: string;
    origem: string;
    link: string;
  }[];
  presencas: { token: string; nome?: string; confirmado: string; nomesAcompanhantes?: string; data: string }[];
  presentes: { token: string; nome?: string; presente: string; valor: string; data: string }[];
  uploads: { tipo: string; nome: string; arquivo: string; data: string }[];
  recados?: { token: string; nome: string; mensagem: string; data: string }[];
  catalogoPresentes?: { nomeOriginal: string; nome: string; preco: string; url: string; imagem: string; ativo: string }[];
  resumo: { totalConvidados: number; totalPresencas: number; totalPresentes: number; totalUploads: number; totalRecados?: number };
};

type TabId = "overview" | "convidados" | "presencas" | "presentes" | "recados" | "midia";

function IconLayout() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H15.75a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25H15.75a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.478-8.091 4.125 4.125 0 00-7.478 8.091 9.337 9.337 0 004.122.952 9.38 9.38 0 002.625-.372m0 0a9.337 9.337 0 01-4.121-.952 4.125 4.125 0 00-7.478-8.091 4.125 4.125 0 00-7.478 8.091 9.337 9.337 0 004.122.952 9.38 9.38 0 002.625-.372m0 0V6.375m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v1.5m-9 0V18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l-1.27-1.27c.196-.29.516-.475.865-.501 1.152-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function IconPhoto() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const SECTION_COPY: Record<TabId, { title: string; subtitle: string }> = {
  overview: {
    title: "Visão geral",
    subtitle: "Resumo do evento e atalhos para as áreas do painel.",
  },
  convidados: {
    title: "Convidados",
    subtitle: "Cadastro, envio em lote e links personalizados.",
  },
  presencas: {
    title: "Presenças",
    subtitle: "Confirmações e exportação para planilha.",
  },
  presentes: {
    title: "Presentes",
    subtitle: "Catálogo no site e registros dos convidados.",
  },
  recados: {
    title: "Recados",
    subtitle: "Mensagens deixadas pelos convidados.",
  },
  midia: {
    title: "Mídia",
    subtitle: "Uploads, fotos e áudios enviados.",
  },
};

const TABLE_WRAP =
  "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04]";
const THEAD_ROW =
  "border-b border-zinc-100 bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500";

function PageSection({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-zinc-100/90 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-casamento-oliva-escuro">{eyebrow}</p>
        ) : null}
        <h2 className="font-heading text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [buscaConvidados, setBuscaConvidados] = useState("");
  const [buscaCatalogoPresentes, setBuscaCatalogoPresentes] = useState("");
  const [filtroOrigemConvidados, setFiltroOrigemConvidados] = useState("");
  const [excluindoToken, setExcluindoToken] = useState<string | null>(null);
  const [excluindoPresenteNome, setExcluindoPresenteNome] = useState<string | null>(null);
  const [editandoConvidado, setEditandoConvidado] = useState<{
    token: string;
    nome: string;
    acompanhantes: string;
    contato: string;
    origem: string;
  } | null>(null);
  const [editandoPresente, setEditandoPresente] = useState<{
    nomeOriginal: string;
    nome: string;
    preco: string;
    url: string;
    imagem: string;
    ativo: string;
  } | null>(null);
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
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    await carregar();
  }

  const fecharEdicaoConvidado = useCallback(() => setEditandoConvidado(null), []);
  const fecharEdicaoPresente = useCallback(() => setEditandoPresente(null), []);

  async function excluirPresente(nomeOriginal: string, nome: string) {
    const ok = window.confirm(
      `Excluir "${nome}" do catálogo?\n\nO item deixa de aparecer na lista de presentes. Compras já registradas na planilha não são apagadas.`
    );
    if (!ok) return;

    setExcluindoPresenteNome(nomeOriginal);
    try {
      const res = await fetch("/api/admin/remover-presente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeOriginal }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) {
        window.alert(data.erro || "Não foi possível excluir.");
        return;
      }
      await carregar();
    } finally {
      setExcluindoPresenteNome(null);
    }
  }

  async function excluirConvidado(token: string, nome: string) {
    const ok = window.confirm(
      `Excluir "${nome}" da lista de convidados?\n\nO link personalizado deixará de funcionar. Registros antigos de presença/presentes na planilha não são apagados automaticamente.`
    );
    if (!ok) return;

    setExcluindoToken(token);
    try {
      const res = await fetch("/api/admin/remover-convidado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) {
        window.alert(data.erro || "Não foi possível excluir.");
        return;
      }
      await carregar();
    } finally {
      setExcluindoToken(null);
    }
  }

  const origensUnicas = useMemo(() => {
    const lista = dados?.convidados ?? [];
    const set = new Set<string>();
    for (const c of lista) {
      const o = (c.origem || "").trim();
      if (o) set.add(o);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [dados]);

  const catalogoPresentesFiltrado = useMemo(() => {
    const lista = dados?.catalogoPresentes ?? [];
    return lista.filter((p) => matchBuscaCatalogoPresente(buscaCatalogoPresentes, p));
  }, [dados?.catalogoPresentes, buscaCatalogoPresentes]);

  if (loading && !dados) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-100">
        <div className="flex flex-col items-center px-4 py-16">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-300 border-t-casamento-oliva-escuro" aria-hidden />
          <p className="mt-4 text-sm font-medium text-zinc-600">Carregando painel…</p>
        </div>
      </main>
    );
  }

  if (!dados) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-zinc-100 px-4">
        <div className="flex w-full max-w-lg flex-col items-center justify-center py-16">
          <div className="w-full rounded-2xl border border-stone-200/80 bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-center text-sm leading-relaxed text-stone-700">
              Não foi possível carregar os dados. Verifique a conexão com o Google (refresh token) e tente novamente.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                carregar();
              }}
              className="mt-6 w-full rounded-xl bg-casamento-oliva-escuro py-3 text-sm font-medium text-white shadow-sm transition hover:bg-casamento-oliva focus:outline-none focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  const convidados = dados.convidados ?? [];
  const totalPessoasEstimado = totalPessoasConvidadas(convidados);
  const presencas = dados.presencas ?? [];
  const uploads = dados.uploads ?? [];
  const recados = dados.recados ?? [];
  const resumo = dados.resumo ?? { totalConvidados: 0, totalPresencas: 0, totalPresentes: 0, totalUploads: 0 };

  const convidadosFiltrados = convidados.filter((c) => {
    const matchOrigem =
      !filtroOrigemConvidados || (c.origem || "").trim() === filtroOrigemConvidados;
    const q = buscaConvidados.trim().toLowerCase();
    const matchBusca =
      !q ||
      c.nome.toLowerCase().includes(q) ||
      c.acompanhantes.toLowerCase().includes(q) ||
      (c.origem || "").toLowerCase().includes(q);
    return matchOrigem && matchBusca;
  });
  const pessoasNoFiltro = totalPessoasConvidadas(convidadosFiltrados);

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
      csv =
        "Nome;Acompanhantes;Contato;Origem;Link\n" +
        convidadosFiltrados
          .map((c) => `${c.nome};${c.acompanhantes};${c.contato};${(c.origem || "").replace(/;/g, ",")};${c.link}`)
          .join("\n");
    } else {
      csv =
        "Nome;Confirmado;Acompanhantes;Data\n" +
        presencasFiltradas
          .map((p) =>
            `${p.nome ?? p.token};${p.confirmado};${(p.nomesAcompanhantes ?? "").replace(/;/g, ",")};${p.data}`
          )
          .join("\n");
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

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Visão geral", icon: <IconLayout /> },
    { id: "convidados", label: "Convidados", icon: <IconUsers />, badge: resumo.totalConvidados },
    { id: "presencas", label: "Presenças", icon: <IconCheck />, badge: resumo.totalPresencas },
    { id: "presentes", label: "Presentes", icon: <IconGift />, badge: resumo.totalPresentes },
    { id: "recados", label: "Recados", icon: <IconChat />, badge: Math.max(recados.length, resumo.totalRecados ?? 0) },
    { id: "midia", label: "Mídia", icon: <IconPhoto />, badge: resumo.totalUploads },
  ];

  function selectTab(id: TabId) {
    setTab(id);
    setMobileNavOpen(false);
  }

  const section = SECTION_COPY[tab];

  return (
    <div className="flex min-h-screen w-full bg-zinc-100">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-zinc-800/90 bg-zinc-950 shadow-2xl transition-transform duration-200 md:static md:z-30 md:translate-x-0 md:shadow-none ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-800/90 px-4">
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold tracking-tight text-white">Casamento</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Painel administrativo</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Fechar"
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Seções do painel">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-casamento-oliva-escuro/90 text-white shadow-md ring-1 ring-white/10"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                <span className={active ? "text-white" : "text-zinc-500"}>{t.icon}</span>
                <span className="flex-1 truncate">{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      active ? "bg-white/15 text-white" : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-zinc-800/90 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-900/50 px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            <IconLogout />
            Sair da conta
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200/90 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:h-16 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm hover:bg-zinc-50 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-lg font-semibold text-zinc-900 sm:text-xl">{section.title}</h1>
            <p className="hidden truncate text-sm text-zinc-500 sm:block">{section.subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
            >
              <IconRefresh />
              <span className="hidden sm:inline">{refreshing ? "Atualizando…" : "Atualizar"}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 sm:inline-flex"
            >
              <IconLogout />
              Sair
            </button>
          </div>
        </header>

        <main className="relative w-full flex-1 bg-zinc-100 bg-[radial-gradient(ellipse_85%_55%_at_50%_-20%,rgba(74,93,58,0.08),transparent)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
          <div className="mx-auto w-full max-w-[1600px] space-y-8 pb-10">
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {[
                {
                  label: "Convites",
                  value: resumo.totalConvidados,
                  sub: "Cadastros com link (uma linha por convite).",
                  bar: "bg-emerald-600",
                },
                {
                  label: "Pessoas",
                  value: totalPessoasEstimado,
                  sub: "Titular + acompanhantes (nomes separados por vírgula ou ;).",
                  bar: "bg-teal-600",
                },
                {
                  label: "Presenças",
                  value: resumo.totalPresencas,
                  sub: "Registros recebidos na planilha.",
                  bar: "bg-amber-500",
                },
                {
                  label: "Presentes",
                  value: resumo.totalPresentes,
                  sub: "Reservas e escolhas no site.",
                  bar: "bg-rose-500",
                },
                {
                  label: "Uploads",
                  value: resumo.totalUploads,
                  sub: "Fotos e áudios enviados.",
                  bar: "bg-sky-500",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04] transition hover:shadow-md"
                >
                  <div className={`absolute left-0 top-0 h-full w-[3px] rounded-l-2xl ${card.bar}`} aria-hidden />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">{card.label}</p>
                  <p className="mt-3 font-heading text-4xl font-normal tabular-nums tracking-tight text-zinc-900">{card.value}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-gradient-to-br from-white via-white to-zinc-50/80 p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-casamento-oliva-escuro">Próximos passos</p>
              <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight text-zinc-900">Atalhos rápidos</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Use o menu à esquerda para cada área. Em <strong className="font-medium text-zinc-700">Convidados</strong> e{" "}
                <strong className="font-medium text-zinc-700">Presenças</strong> você pode exportar CSV para Excel ou Google Sheets.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTab("convidados")}
                  className="rounded-xl bg-casamento-oliva-escuro px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-casamento-oliva"
                >
                  Convidados
                </button>
                <button
                  type="button"
                  onClick={() => setTab("presencas")}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  Presenças
                </button>
                <button
                  type="button"
                  onClick={() => setTab("presentes")}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  Presentes
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "convidados" && (
          <div className="space-y-10">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm ring-1 ring-zinc-950/[0.04] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Resumo</p>
                  <p className="mt-1 text-sm text-zinc-600">
                    <span className="font-heading text-2xl font-semibold tabular-nums text-zinc-900">{resumo.totalConvidados}</span>
                    <span className="text-zinc-500"> convites</span>
                    <span className="mx-2 text-zinc-300">·</span>
                    <span className="font-heading text-2xl font-semibold tabular-nums text-casamento-oliva-escuro">{totalPessoasEstimado}</span>
                    <span className="text-zinc-500"> pessoas</span>
                  </p>
                  <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500">
                    Cada convite conta 1 titular (nome) + cada nome em <strong className="font-medium text-zinc-700">Acompanhantes</strong>, separados
                    por vírgula ou ponto e vírgula (ex.: Maria, Pedro, Tiago).
                  </p>
                </div>
                {(buscaConvidados.trim() || filtroOrigemConvidados) && (
                  <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-600">
                    Filtro: <strong className="text-zinc-900">{convidadosFiltrados.length}</strong> convites ·{" "}
                    <strong className="text-zinc-900">{pessoasNoFiltro}</strong> pessoas
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
              <AddConvidado onAdicionado={carregar} />
              <EnvioEmLote onAdicionados={carregar} />
            </div>

            <section>
              <PageSection
                eyebrow="Lista"
                title="Convidados e links"
                description="Copie o convite personalizado ou envie direto pelo WhatsApp. A contagem de pessoas usa nome + acompanhantes."
                actions={
                  <>
                    <label className="sr-only" htmlFor="filtro-origem-convidados">
                      Grupo ou origem
                    </label>
                    <select
                      id="filtro-origem-convidados"
                      value={filtroOrigemConvidados}
                      onChange={(e) => setFiltroOrigemConvidados(e.target.value)}
                      className="min-w-[10rem] max-w-[min(100%,16rem)] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
                      title="Filtrar por grupo ou origem"
                    >
                      <option value="">Todos os grupos</option>
                      {origensUnicas.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    <input
                      type="search"
                      placeholder="Buscar por nome ou origem…"
                      value={buscaConvidados}
                      onChange={(e) => setBuscaConvidados(e.target.value)}
                      className="min-w-[200px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
                    />
                    <button
                      type="button"
                      onClick={() => exportarCSV("convidados")}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-casamento-oliva-escuro shadow-sm transition hover:bg-zinc-50"
                    >
                      Exportar CSV
                    </button>
                  </>
                }
              />
              <div className={TABLE_WRAP}>
                <div className="max-h-[min(65vh,34rem)] overflow-auto overscroll-y-contain">
                  <table className="w-full min-w-[860px] text-sm leading-relaxed">
                    <thead>
                      <tr className={`${THEAD_ROW} sticky top-0 z-10 shadow-[0_1px_0_0_rgb(228_228_231)]`}>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Acompanhantes</th>
                        <th className="whitespace-nowrap px-4 py-3 text-center" title="1 titular + nomes separados por vírgula ou ;">
                          Pessoas
                        </th>
                        <th className="px-4 py-3">Grupo / origem</th>
                        <th className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {convidadosFiltrados.map((c) => (
                        <tr key={c.token} className="transition hover:bg-zinc-50/80">
                          <td className="px-4 py-3.5 font-medium text-zinc-900">{c.nome}</td>
                          <td className="px-4 py-3.5 text-zinc-600">{c.acompanhantes || "—"}</td>
                          <td className="px-4 py-3.5 text-center tabular-nums text-zinc-800">
                            <span className="inline-flex min-w-[2rem] justify-center rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold">
                              {contarPessoasNoConvite(c.nome, c.acompanhantes)}
                            </span>
                          </td>
                          <td className="max-w-[14rem] px-4 py-3.5 text-zinc-600">
                            {c.origem ? (
                              <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">
                                {c.origem}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(c.link)}
                                className="rounded-lg bg-casamento-pastel/50 px-2.5 py-1 text-xs font-medium text-casamento-oliva-escuro transition hover:bg-casamento-pastel"
                              >
                                Copiar link
                              </button>
                              <a
                                href={buildConviteWhatsAppUrl(c.link, c.nome)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                              >
                                WhatsApp
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditandoConvidado({
                                    token: c.token,
                                    nome: c.nome,
                                    acompanhantes: c.acompanhantes,
                                    contato: c.contato,
                                    origem: c.origem || "",
                                  })
                                }
                                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => excluirConvidado(c.token, c.nome)}
                                disabled={excluindoToken === c.token}
                                className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Excluir convidado da planilha"
                              >
                                {excluindoToken === c.token ? "Excluindo…" : "Excluir"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {convidadosFiltrados.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-zinc-500">Nenhum convidado encontrado com esse filtro.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === "presencas" && (
          <div className="space-y-6">
            <PageSection
              eyebrow="Confirmações"
              title="Presenças"
              description="Filtre por status e exporte os dados para planilha quando precisar."
              actions={
                <>
                  <select
                    value={filtroPresenca}
                    onChange={(e) => setFiltroPresenca(e.target.value as "todos" | "sim" | "nao")}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
                  >
                    <option value="todos">Todos</option>
                    <option value="sim">Confirmados</option>
                    <option value="nao">Não confirmados</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => exportarCSV("presencas")}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-casamento-oliva-escuro shadow-sm transition hover:bg-zinc-50"
                  >
                    Exportar CSV
                  </button>
                </>
              }
            />
            <div className={TABLE_WRAP}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm leading-relaxed">
                  <thead>
                    <tr className={THEAD_ROW}>
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Confirmado</th>
                      <th className="px-4 py-3">Acompanhantes</th>
                      <th className="px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {presencasFiltradas.map((p, i) => (
                      <tr key={i} className="transition hover:bg-zinc-50/80">
                        <td className="px-4 py-3.5 font-medium text-zinc-900">{p.nome ?? p.token}</td>
                        <td className="px-4 py-3.5 text-zinc-700">{p.confirmado}</td>
                        <td className="max-w-[220px] truncate px-4 py-3.5 text-zinc-600" title={p.nomesAcompanhantes}>
                          {p.nomesAcompanhantes || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{p.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {presencasFiltradas.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-zinc-500">Nenhum registro com esse filtro.</p>
              )}
            </div>
          </div>
        )}

        {tab === "presentes" && (
          <div className="space-y-10">
            <section>
              <PageSection
                eyebrow="Loja"
                title="Catálogo de presentes"
                description="Itens exibidos na lista de presentes do site para os convidados."
              />
              <AddPresente onAdicionado={carregar} />
              {dados.catalogoPresentes && dados.catalogoPresentes.length > 0 ? (
                <>
                  <label className="mt-6 block max-w-md">
                    <span className="sr-only">Buscar no catálogo</span>
                    <input
                      type="search"
                      placeholder="Buscar por nome ou preço…"
                      value={buscaCatalogoPresentes}
                      onChange={(e) => setBuscaCatalogoPresentes(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
                    />
                  </label>
                  {catalogoPresentesFiltrado.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500">
                      Nenhum item encontrado com essa busca.
                    </p>
                  ) : (
                <div className={`mt-4 ${TABLE_WRAP}`}>
                  <div className="max-h-[min(65vh,34rem)] overflow-auto overscroll-y-contain">
                    <table className="w-full min-w-[720px] text-sm leading-relaxed">
                      <thead>
                        <tr className={`${THEAD_ROW} sticky top-0 z-10 shadow-[0_1px_0_0_rgb(228_228_231)]`}>
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3">Preço</th>
                          <th className="px-4 py-3">Ativo</th>
                          <th className="px-4 py-3">URL</th>
                          <th className="px-4 py-3">Imagem</th>
                          <th className="px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {catalogoPresentesFiltrado.map((p) => {
                          const inativo = !p.ativo.trim().toLowerCase().startsWith("s");
                          return (
                          <tr
                            key={p.nomeOriginal}
                            className={`transition hover:bg-zinc-50/80 ${inativo ? "opacity-60" : ""}`}
                          >
                            <td className="px-4 py-3.5 font-medium text-zinc-900">{p.nome}</td>
                            <td className="px-4 py-3.5 text-zinc-600">{p.preco ? `R$ ${p.preco}` : "—"}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                  inativo
                                    ? "bg-zinc-100 text-zinc-600"
                                    : "bg-casamento-pastel/60 text-casamento-oliva-escuro"
                                }`}
                              >
                                {inativo ? "Não" : "Sim"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {p.url ? (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-casamento-oliva-escuro hover:underline"
                                >
                                  Abrir loja
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {p.imagem ? (
                                <a
                                  href={p.imagem}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block h-14 w-14 overflow-hidden rounded-lg border border-zinc-200 transition hover:opacity-90"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.imagem} alt={p.nome} className="h-full w-full object-cover" />
                                </a>
                              ) : (
                                <span className="text-zinc-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditandoPresente({
                                      nomeOriginal: p.nomeOriginal,
                                      nome: p.nome,
                                      preco: p.preco,
                                      url: p.url,
                                      imagem: p.imagem,
                                      ativo: p.ativo,
                                    })
                                  }
                                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => excluirPresente(p.nomeOriginal, p.nome)}
                                  disabled={excluindoPresenteNome === p.nomeOriginal}
                                  className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Excluir do catálogo"
                                >
                                  {excluindoPresenteNome === p.nomeOriginal ? "Excluindo…" : "Excluir"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                  )}
                </>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-8 text-center text-sm text-zinc-500">
                  Nenhum item no catálogo ainda.
                </p>
              )}
            </section>

            <section>
              <PageSection
                eyebrow="Histórico"
                title="Registros de presentes"
                description="Quem comprou (pelo link do convite), presente e valor. O item continua na lista do catálogo."
              />
              <SincronizarPagamentoMP onSincronizado={carregar} />
              <div className={TABLE_WRAP}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm leading-relaxed">
                    <thead>
                      <tr className={THEAD_ROW}>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Presente</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(dados.presentes ?? []).map((p, i) => (
                        <tr key={i} className="transition hover:bg-zinc-50/80">
                          <td className="px-4 py-3.5 font-medium text-zinc-900">{p.nome ?? p.token}</td>
                          <td className="px-4 py-3.5 text-zinc-700">{p.presente}</td>
                          <td className="px-4 py-3.5 text-zinc-600">{p.valor ? `R$ ${p.valor}` : "—"}</td>
                          <td className="px-4 py-3.5 text-zinc-500">{p.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(dados.presentes ?? []).length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-zinc-500">Nenhum registro ainda.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {tab === "recados" && (
          <div>
            <PageSection
              eyebrow="Mensagens"
              title="Recados"
              description="Mensagens da confirmação de presença e da página de recados."
            />
            {recados.length > 0 ? (
              <div className={TABLE_WRAP}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm leading-relaxed">
                    <thead>
                      <tr className={THEAD_ROW}>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Mensagem</th>
                        <th className="px-4 py-3">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {recados.map((r, i) => (
                        <tr key={`${r.token}-${i}`} className="transition hover:bg-zinc-50/80">
                          <td className="px-4 py-3.5 font-medium text-zinc-900">{r.nome}</td>
                          <td className="px-4 py-3.5 text-zinc-700">{r.mensagem}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{r.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
                <div className="flex justify-center text-zinc-400">
                  <IconChat />
                </div>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">
                  Ainda não há recados. Quando os convidados enviarem, aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "midia" && (
          <div className="space-y-10">
            {fotos.length > 0 && (
              <section>
                <PageSection
                  eyebrow="Galeria"
                  title="Fotos enviadas"
                  description="Miniaturas via Google Drive quando o link permitir."
                />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
                  {fotos.map((u, i) => {
                    const fileId = extrairFileId(u.arquivo);
                    const thumbUrl = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w200` : null;
                    return (
                      <a
                        key={i}
                        href={u.arquivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-sm transition hover:ring-2 hover:ring-casamento-pastel/60"
                      >
                        {thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumbUrl} alt={u.nome} className="h-full w-full object-cover transition group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">Foto</div>
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <PageSection
                eyebrow="Arquivos"
                title="Todos os uploads"
                description="Fotos e áudios enviados pelos convidados."
              />
              {uploads.length > 0 ? (
                <div className={TABLE_WRAP}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm leading-relaxed">
                      <thead>
                        <tr className={THEAD_ROW}>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3">Arquivo</th>
                          <th className="px-4 py-3">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {uploads.map((u, i) => (
                          <tr key={i} className="transition hover:bg-zinc-50/80">
                            <td className="px-4 py-3.5">
                              <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                                {u.tipo}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-zinc-900">{u.nome}</td>
                            <td className="px-4 py-3.5">
                              {u.arquivo?.startsWith("http") ? (
                                <a
                                  href={u.arquivo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-casamento-oliva-escuro hover:underline"
                                >
                                  Abrir
                                </a>
                              ) : (
                                u.arquivo
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-zinc-500">{u.data}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-14 text-center">
                  <div className="flex justify-center text-zinc-400">
                    <IconPhoto />
                  </div>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-600">Nenhum upload registrado.</p>
                </div>
              )}
            </section>
          </div>
        )}
          </div>
        </main>
      </div>
      <EditarConvidadoModal convidado={editandoConvidado} onClose={fecharEdicaoConvidado} onSalvo={carregar} />
      <EditarPresenteModal presente={editandoPresente} onClose={fecharEdicaoPresente} onSalvo={carregar} />
    </div>
  );
}
