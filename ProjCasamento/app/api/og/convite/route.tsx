import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { EVENTO, getDataHoraConviteUppercase } from "@/lib/evento";
import { getConviteCapaAbsoluteUrl, getConviteLogoAbsoluteUrl } from "@/lib/convite-og-urls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLOSSENSES =
  "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.";

const OLIVE = "#4B5320";
const CREAM = "#F0EBE1";
const LOGO_FILE = process.env.NEXT_PUBLIC_CONVITE_LOGO?.trim() || "/convite/logo.png";
const CAPA_FILE = process.env.NEXT_PUBLIC_CONVITE_CAPA?.trim() || "/convite/capa.png";

async function readPublicImageDataUrl(relativePath: string): Promise<string | null> {
  const normalized = relativePath.replace(/^\//, "");
  try {
    const buf = await readFile(join(process.cwd(), "public", ...normalized.split("/")));
    const ext = normalized.split(".").pop()?.toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fetchRemoteImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function loadImageDataUrl(relativePath: string, absoluteUrl: string): Promise<string | null> {
  return (await readPublicImageDataUrl(relativePath)) ?? (await fetchRemoteImageDataUrl(absoluteUrl));
}

async function loadCinzelFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/cinzel/v26/8vIS7ww63mVuGiDBKNk8.woff",
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

async function logoFallbackResponse() {
  try {
    const buf = await readFile(join(process.cwd(), "public", ...LOGO_FILE.replace(/^\//, "").split("/")));
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("OG image unavailable", { status: 500 });
  }
}

async function buildOgImage() {
  const { primeiro, segundo, monograma } = EVENTO.noivos;
  const [logoDataUrl, capaDataUrl, cinzel] = await Promise.all([
    loadImageDataUrl(LOGO_FILE, getConviteLogoAbsoluteUrl()),
    loadImageDataUrl(CAPA_FILE, getConviteCapaAbsoluteUrl()),
    loadCinzelFont(),
  ]);

  const fontFamily = cinzel ? "Cinzel" : "serif";
  const fonts = cinzel
    ? [{ name: "Cinzel", data: cinzel, weight: 700 as const, style: "normal" as const }]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: CREAM,
          position: "relative",
        }}
      >
        {capaDataUrl ? (
          <img
            src={capaDataUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              objectPosition: "center 70%",
              opacity: 0.2,
            }}
          />
        ) : null}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "92%",
            height: "88%",
            border: `3px solid ${OLIVE}`,
            backgroundColor: "rgba(240, 235, 225, 0.92)",
            padding: "32px 40px",
          }}
        >
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt=""
              width={120}
              height={120}
              style={{ objectFit: "contain", marginBottom: 8 }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                border: `2px solid ${OLIVE}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                color: OLIVE,
                fontFamily,
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {monograma[0]}
              {monograma[1]}
            </div>
          )}

          <div
            style={{
              fontFamily,
              fontSize: 52,
              fontWeight: 700,
              color: OLIVE,
              marginBottom: 16,
            }}
          >
            {primeiro} & {segundo}
          </div>

          <div
            style={{
              fontFamily,
              fontSize: 20,
              color: OLIVE,
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: 900,
              marginBottom: 10,
              opacity: 0.95,
            }}
          >
            {`"${COLOSSENSES}"`}
          </div>

          <div
            style={{
              fontFamily,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: OLIVE,
              marginBottom: 18,
            }}
          >
            Colossenses 3:14
          </div>

          <div
            style={{
              fontFamily,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Com as bênçãos de Deus
          </div>

          <div
            style={{
              fontFamily,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
            }}
          >
            {getDataHoraConviteUppercase()}
          </div>

          <div
            style={{
              fontFamily,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
              marginTop: 8,
              opacity: 0.9,
            }}
          >
            {EVENTO.local.nome} · {EVENTO.local.cidade}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}

export async function GET() {
  try {
    const response = await buildOgImage();
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0) {
      return logoFallbackResponse();
    }
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[og/convite]", err);
    return logoFallbackResponse();
  }
}
