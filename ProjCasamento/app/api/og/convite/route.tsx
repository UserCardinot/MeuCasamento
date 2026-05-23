import { ImageResponse } from "next/og";
import { EVENTO, getDataHoraConviteUppercase } from "@/lib/evento";
import { getConviteCapaAbsoluteUrl, getConviteLogoAbsoluteUrl } from "@/lib/convite-og-urls";

export const runtime = "edge";

const COLOSSENSES =
  "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.";

const OLIVE = "#4B5320";
const CREAM = "#F0EBE1";

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

function fallbackImage() {
  const { primeiro, segundo } = EVENTO.noivos;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: CREAM,
          color: OLIVE,
          padding: 48,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>
          {primeiro} & {segundo}
        </div>
        <div style={{ fontSize: 24, textTransform: "uppercase", letterSpacing: 2 }}>
          Com as bênçãos de Deus
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

async function imageReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "force-cache" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const { primeiro, segundo } = EVENTO.noivos;
    const logoUrl = getConviteLogoAbsoluteUrl();
    const capaUrl = getConviteCapaAbsoluteUrl();
    const [cinzel, hasLogo, hasCapa] = await Promise.all([
      loadCinzelFont(),
      imageReachable(logoUrl),
      imageReachable(capaUrl),
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
          {hasCapa ? (
            <img
              src={capaUrl}
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
            {hasLogo ? (
              <img
                src={logoUrl}
                alt=""
                width={130}
                height={130}
                style={{ objectFit: "contain", marginBottom: 4 }}
              />
            ) : (
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 999,
                  border: `2px solid ${OLIVE}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  color: OLIVE,
                  fontFamily,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: -4,
                }}
              >
                {EVENTO.noivos.monograma[0]}
                {EVENTO.noivos.monograma[1]}
              </div>
            )}

            <div
              style={{
                fontFamily,
                fontSize: 56,
                fontWeight: 700,
                color: OLIVE,
                marginTop: 8,
                marginBottom: 20,
                letterSpacing: 1,
              }}
            >
              {primeiro} & {segundo}
            </div>

            <div
              style={{
                fontFamily,
                fontSize: 22,
                fontStyle: "italic",
                color: OLIVE,
                textAlign: "center",
                lineHeight: 1.35,
                maxWidth: 900,
                marginBottom: 12,
                opacity: 0.95,
              }}
            >
              “{COLOSSENSES}”
            </div>

            <div
              style={{
                fontFamily,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OLIVE,
                marginBottom: 22,
              }}
            >
              Colossenses 3:14
            </div>

            <div
              style={{
                fontFamily,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: OLIVE,
                textAlign: "center",
                marginBottom: 14,
              }}
            >
              Com as bênçãos de Deus
            </div>

            <div
              style={{
                fontFamily,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: OLIVE,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {getDataHoraConviteUppercase()}
            </div>

            <div
              style={{
                fontFamily,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: OLIVE,
                textAlign: "center",
                marginTop: 10,
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
  } catch (err) {
    console.error("[og/convite]", err);
    return fallbackImage();
  }
}
