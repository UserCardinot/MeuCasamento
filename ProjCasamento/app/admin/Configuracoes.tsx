"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

type EventoConfig = {
  slug: string;
  dominio: string;
  tipo: string;
  tema: string;
  titulo: string;
  anfitrioes: string;
  data: string;
  hora: string;
  localNome: string;
  localEndereco: string;
  localCidade: string;
  localMapUrl: string;
  mensagemConvite: string;
  textoCapa: string;
  whatsappTemplate: string;
  pixChave: string;
  pixNome: string;
  pixCidade: string;
  mpTaxaPercent: string;
  mpSandbox: boolean;
  mpConfigurado: boolean;
  prazoConfirmacao: string;
  listaPresentes: boolean;
};

type UsuarioConfig = { login: string; nome: string; papel: string; trocarSenha: boolean };

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm transition-all placeholder:text-zinc-400 focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500";
const btnPrimario =
  "rounded-lg bg-casamento-oliva-escuro px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-casamento-oliva disabled:opacity-50";

function Cartao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04]">
      <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-4 sm:px-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-zinc-900">{titulo}</h2>
        {descricao ? <p className="mt-1 text-sm text-zinc-500">{descricao}</p> : null}
      </div>
      <div className="grid gap-4 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Campo({
  id,
  label,
  dica,
  children,
}: {
  id: string;
  label: string;
  dica?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {dica ? <p className="mt-1.5 text-xs text-zinc-400">{dica}</p> : null}
    </div>
  );
}

export default function Configuracoes({ onSalvo }: { onSalvo: () => void }) {
  const [ev, setEv] = useState<EventoConfig | null>(null);
  const [usuario, setUsuario] = useState<UsuarioConfig | null>(null);
  const [erroCarregar, setErroCarregar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [mpToken, setMpToken] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [msgSenha, setMsgSenha] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/configuracoes");
      const data = await res.json();
      if (!res.ok) {
        setErroCarregar(data.erro || "Erro ao carregar.");
        return;
      }
      setEv(data.evento);
      setUsuario(data.usuario);
    } catch {
      setErroCarregar("Erro de conexão.");
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function set<K extends keyof EventoConfig>(k: K, v: EventoConfig[K]) {
    setEv((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function salvar(extra: Record<string, unknown> = {}) {
    if (!ev) return;
    setSalvando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ev, ...(mpToken.trim() ? { mpAccessToken: mpToken.trim() } : {}), ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ tipo: "erro", texto: data.erro || "Erro ao salvar." });
        return;
      }
      setEv(data.evento);
      setMpToken("");
      setMsg({ tipo: "ok", texto: "Configurações salvas." });
      onSalvo();
    } catch {
      setMsg({ tipo: "erro", texto: "Erro de conexão." });
    } finally {
      setSalvando(false);
    }
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsgSenha(null);
    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: "erro", texto: "A confirmação não confere com a nova senha." });
      return;
    }
    setSalvandoSenha(true);
    try {
      const res = await fetch("/api/admin/trocar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsgSenha({ tipo: "erro", texto: data.erro || "Erro ao trocar a senha." });
        return;
      }
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setMsgSenha({ tipo: "ok", texto: "Senha alterada com sucesso." });
      setUsuario((u) => (u ? { ...u, trocarSenha: false } : u));
      onSalvo();
    } catch {
      setMsgSenha({ tipo: "erro", texto: "Erro de conexão." });
    } finally {
      setSalvandoSenha(false);
    }
  }

  if (erroCarregar) return <p className="text-sm text-red-600">{erroCarregar}</p>;
  if (!ev || !usuario) return <p className="text-sm text-zinc-500">Carregando…</p>;

  const soPresentes = ev.tipo === "so_presentes";
  const isSuper = usuario.papel === "super";

  const formSenha = (
    <Cartao
      titulo="Minha senha"
      descricao={`Usuário: ${usuario.login}. ${usuario.trocarSenha ? "Você está com senha provisória — crie uma nova." : ""}`}
    >
      <form onSubmit={trocarSenha} className="grid gap-4 md:grid-cols-3">
        <Campo id="cfg-senha-atual" label="Senha atual">
          <input
            id="cfg-senha-atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </Campo>
        <Campo id="cfg-senha-nova" label="Nova senha" dica="Mínimo 6 caracteres.">
          <input
            id="cfg-senha-nova"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </Campo>
        <Campo id="cfg-senha-conf" label="Repita a nova senha">
          <input
            id="cfg-senha-conf"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            required
          />
        </Campo>
        <div className="flex flex-wrap items-center gap-3 md:col-span-3">
          <button type="submit" disabled={salvandoSenha} className={btnPrimario}>
            {salvandoSenha ? "Salvando…" : "Trocar senha"}
          </button>
          {msgSenha && (
            <p className={`text-sm ${msgSenha.tipo === "ok" ? "text-emerald-700" : "text-red-600"}`}>{msgSenha.texto}</p>
          )}
        </div>
      </form>
    </Cartao>
  );

  return (
    <div className="space-y-8">
      {usuario.trocarSenha && formSenha}

      <Cartao titulo="Dados do evento" descricao={`Endereço do site: https://${ev.dominio}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <Campo id="cfg-titulo" label="Título do evento" dica='Ex.: "Aniversário de 2 anos do Henry" ou "Casamento".'>
            <input id="cfg-titulo" value={ev.titulo} onChange={(e) => set("titulo", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-anfitrioes" label={soPresentes ? "Nomes dos noivos" : "Nome em destaque"} dica={soPresentes ? 'Ex.: "Ediane & João".' : 'Ex.: "Henry".'}>
            <input id="cfg-anfitrioes" value={ev.anfitrioes} onChange={(e) => set("anfitrioes", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-data" label="Data">
            <input id="cfg-data" type="date" value={ev.data} onChange={(e) => set("data", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-hora" label="Horário">
            <input id="cfg-hora" type="time" value={ev.hora} onChange={(e) => set("hora", e.target.value)} className={inputClass} />
          </Campo>
          <Campo
            id="cfg-prazo"
            label="Confirmar presença até"
            dica="Último dia em que o convidado consegue confirmar. Depois disso a confirmação fecha sozinha. Vazio = sem prazo."
          >
            <input
              id="cfg-prazo"
              type="date"
              value={ev.prazoConfirmacao}
              onChange={(e) => set("prazoConfirmacao", e.target.value)}
              className={inputClass}
            />
          </Campo>
          <Campo id="cfg-lista" label="Lista de presentes">
            <label className="flex h-[42px] items-center gap-2 text-sm text-zinc-700">
              <input
                id="cfg-lista"
                type="checkbox"
                checked={ev.listaPresentes}
                onChange={(e) => set("listaPresentes", e.target.checked)}
              />
              Mostrar a lista de presentes para os convidados
            </label>
          </Campo>
          <Campo id="cfg-local" label="Nome do local">
            <input id="cfg-local" value={ev.localNome} onChange={(e) => set("localNome", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-cidade" label="Cidade">
            <input id="cfg-cidade" value={ev.localCidade} onChange={(e) => set("localCidade", e.target.value)} className={inputClass} />
          </Campo>
          <div className="md:col-span-2">
            <Campo id="cfg-endereco" label="Endereço completo">
              <input id="cfg-endereco" value={ev.localEndereco} onChange={(e) => set("localEndereco", e.target.value)} className={inputClass} />
            </Campo>
          </div>
          <div className="md:col-span-2">
            <Campo id="cfg-mapa" label="Link do Google Maps" dica='No Google Maps, toque em "Compartilhar" e cole o link aqui. Aparece o botão "Como chegar".'>
              <input id="cfg-mapa" value={ev.localMapUrl} onChange={(e) => set("localMapUrl", e.target.value)} className={inputClass} placeholder="https://maps.app.goo.gl/..." />
            </Campo>
          </div>
          <div className="md:col-span-2">
            {soPresentes ? (
              <Campo id="cfg-capa" label="Texto da página inicial" dica="Aparece logo abaixo dos nomes, na página que o convidado abre.">
                <textarea id="cfg-capa" rows={3} value={ev.textoCapa} onChange={(e) => set("textoCapa", e.target.value)} className={inputClass} />
              </Campo>
            ) : (
              <Campo id="cfg-msg" label="Frase do convite" dica="Aparece em destaque no convite.">
                <textarea id="cfg-msg" rows={3} value={ev.mensagemConvite} onChange={(e) => set("mensagemConvite", e.target.value)} className={inputClass} />
              </Campo>
            )}
          </div>
        </div>
      </Cartao>

      <Cartao
        titulo="Mensagem do WhatsApp"
        descricao="Texto enviado ao clicar em “WhatsApp” na lista de convidados."
      >
        <Campo
          id="cfg-whats"
          label="Modelo da mensagem"
          dica={
            <>
              Use: <code>{"{nome}"}</code> (primeiro nome do convidado), <code>{"{link}"}</code> (link do convite),{" "}
              <code>{"{data}"}</code>, <code>{"{hora}"}</code>, <code>{"{titulo}"}</code>, <code>{"{dias}"}</code> (dias que faltam).
            </>
          }
        >
          <textarea id="cfg-whats" rows={7} value={ev.whatsappTemplate} onChange={(e) => set("whatsappTemplate", e.target.value)} className={`${inputClass} font-mono`} />
        </Campo>
      </Cartao>

      <Cartao titulo="Pix" descricao="O site gera o QR Code com o valor dos presentes escolhidos.">
        <div className="grid gap-4 md:grid-cols-3">
          <Campo id="cfg-pix-chave" label="Chave Pix" dica="CPF, e-mail, telefone (+55...) ou chave aleatória.">
            <input id="cfg-pix-chave" value={ev.pixChave} onChange={(e) => set("pixChave", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-pix-nome" label="Nome do recebedor" dica="Como aparece no banco (sem acento).">
            <input id="cfg-pix-nome" value={ev.pixNome} onChange={(e) => set("pixNome", e.target.value)} className={inputClass} />
          </Campo>
          <Campo id="cfg-pix-cidade" label="Cidade do recebedor">
            <input id="cfg-pix-cidade" value={ev.pixCidade} onChange={(e) => set("pixCidade", e.target.value)} className={inputClass} />
          </Campo>
        </div>
      </Cartao>

      <Cartao
        titulo="Cartão de crédito (Mercado Pago)"
        descricao={ev.mpConfigurado ? "Configurado ✓ — o cartão já aparece na lista de presentes." : "Não configurado — os convidados só verão a opção Pix."}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Campo
              id="cfg-mp-token"
              label={ev.mpConfigurado ? "Trocar Access Token" : "Access Token"}
              dica="Mercado Pago → Seu negócio → Configurações → Credenciais de produção → Access Token (começa com APP_USR-). Fica guardado criptografado."
            >
              <input
                id="cfg-mp-token"
                type="password"
                value={mpToken}
                onChange={(e) => setMpToken(e.target.value)}
                className={inputClass}
                placeholder={ev.mpConfigurado ? "•••••••• (deixe vazio para manter)" : "APP_USR-..."}
                autoComplete="off"
              />
            </Campo>
          </div>
          <Campo id="cfg-mp-taxa" label="Taxa repassada (%)" dica="Acrescentada no cartão. 0 = sem taxa.">
            <input id="cfg-mp-taxa" value={ev.mpTaxaPercent} onChange={(e) => set("mpTaxaPercent", e.target.value)} className={inputClass} inputMode="decimal" />
          </Campo>
          <label className="flex items-center gap-2 text-sm text-zinc-700 md:col-span-3">
            <input type="checkbox" checked={ev.mpSandbox} onChange={(e) => set("mpSandbox", e.target.checked)} />
            Modo teste (sandbox) — só para testar com credenciais de teste
          </label>
          {ev.mpConfigurado && (
            <div className="md:col-span-3">
              <button
                type="button"
                className="text-sm font-medium text-red-700 hover:underline"
                onClick={() => {
                  if (window.confirm("Remover o Access Token? O cartão deixará de aparecer para os convidados.")) {
                    salvar({ mpRemoverToken: true });
                  }
                }}
              >
                Remover cartão
              </button>
            </div>
          )}
        </div>
      </Cartao>

      {isSuper && (
        <Cartao titulo="Avançado (super admin)" descricao={`Evento: ${ev.slug}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <Campo id="cfg-tipo" label="Tipo">
              <select id="cfg-tipo" value={ev.tipo} onChange={(e) => set("tipo", e.target.value)} className={inputClass}>
                <option value="convite_completo">Convite completo</option>
                <option value="so_presentes">Só presença, presentes e recados</option>
              </select>
            </Campo>
            <Campo id="cfg-tema" label="Tema visual">
              <select id="cfg-tema" value={ev.tema} onChange={(e) => set("tema", e.target.value)} className={inputClass}>
                <option value="mickey">Mickey</option>
                <option value="oliva">Verde oliva</option>
              </select>
            </Campo>
          </div>
        </Cartao>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
        <button type="button" disabled={salvando} onClick={() => salvar()} className={btnPrimario}>
          {salvando ? "Salvando…" : "Salvar configurações"}
        </button>
        {msg && <p className={`text-sm ${msg.tipo === "ok" ? "text-emerald-700" : "text-red-600"}`}>{msg.texto}</p>}
      </div>

      {!usuario.trocarSenha && formSenha}
    </div>
  );
}
