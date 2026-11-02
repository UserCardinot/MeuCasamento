import { ImageResponse } from "next/og";
import { getEventoAtual, toEventoPublico } from "@/lib/evento-atual";
import { getDataHoraConviteUppercase, nomeDestaque } from "@/lib/evento";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PALETAS: Record<string, { cor: string; fundo: string; destaque: string }> = {
  oliva: { cor: "#4B5320", fundo: "#F0EBE1", destaque: "#B8860B" },
  mickey: { cor: "#C8102E", fundo: "#FFF8E1", destaque: "#111111" },
};

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET() {
  const ev = await getEventoAtual();
  if (!ev) return new Response("Evento não encontrado", { status: 404 });
  const evento = toEventoPublico(ev);
  const p = PALETAS[evento.tema] ?? PALETAS.oliva;

  const cinzel = await loadFont("https://fonts.gstatic.com/s/cinzel/v26/8vIS7ww63mVuGiDBKNk8.woff");
  const fontFamily = cinzel ? "Cinzel" : "serif";
  const fonts = cinzel
    ? [{ name: "Cinzel", data: cinzel, weight: 700 as const, style: "normal" as const }]
    : undefined;

  const linhaLocal = [evento.localNome, evento.localCidade].filter(Boolean).join(" · ");

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: p.fundo,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "92%",
              height: "88%",
              border: `4px solid ${p.cor}`,
              padding: "32px 40px",
              color: p.cor,
              fontFamily,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", marginBottom: 18 }}>
              {evento.titulo || "Convite"}
            </div>
            <div style={{ fontSize: 78, fontWeight: 700, marginBottom: 24 }}>{nomeDestaque(evento)}</div>
            {getDataHoraConviteUppercase(evento) ? (
              <div style={{ fontSize: 24, letterSpacing: 2, marginBottom: 10 }}>
                {getDataHoraConviteUppercase(evento)}
              </div>
            ) : null}
            {linhaLocal ? (
              <div style={{ fontSize: 20, letterSpacing: 1.5, textTransform: "uppercase", color: p.destaque }}>
                {linhaLocal}
              </div>
            ) : null}
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts }
    );
  } catch (err) {
    console.error("[og/convite]", err);
    return new Response("OG image unavailable", { status: 500 });
  }
}
