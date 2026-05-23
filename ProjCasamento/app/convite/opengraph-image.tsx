import { ImageResponse } from "next/og";
import { EVENTO, getDataHoraConviteUppercase } from "@/lib/evento";
import { loadConviteCapaDataUrl, loadConviteLogoDataUrl } from "@/lib/convite-og-assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Convite de casamento Lucas & Beatriz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOSSENSES =
  "Acima de tudo, porém, revistam‑se do amor, que é o elo perfeito.";

const OLIVE = "#4B5320";
const CREAM = "#F0EBE1";

async function loadFonts() {
  const [cinzel, playfair, italianno] = await Promise.all([
    fetch("https://fonts.gstatic.com/s/cinzel/v26/8vIS7ww63mVuGiDBKNk8.woff").then((r) => r.arrayBuffer()),
    fetch("https://fonts.gstatic.com/s/playfairdisplay/v39/nuFiD-vYSZviVYUb_rj3ij__anPXDTnogkk9.woff").then((r) =>
      r.arrayBuffer()
    ),
    fetch("https://fonts.gstatic.com/s/italianno/v23/6NUU8F2O_JDv0Wq9L2Jo.woff").then((r) => r.arrayBuffer()),
  ]);

  return [
    { name: "Cinzel", data: cinzel, weight: 700 as const, style: "normal" as const },
    { name: "Cinzel", data: cinzel, weight: 500 as const, style: "normal" as const },
    { name: "Playfair", data: playfair, weight: 400 as const, style: "italic" as const },
    { name: "Italianno", data: italianno, weight: 400 as const, style: "normal" as const },
  ];
}

export default async function Image() {
  const { primeiro, segundo, monograma } = EVENTO.noivos;
  const [logoDataUrl, capaDataUrl, fonts] = await Promise.all([
    loadConviteLogoDataUrl(),
    loadConviteCapaDataUrl(),
    loadFonts(),
  ]);

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
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 70%",
              opacity: 0.22,
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 28,
            border: `2px solid ${OLIVE}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 48px",
            backgroundColor: "rgba(240, 235, 225, 0.88)",
          }}
        >
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt=""
              width={150}
              height={150}
              style={{ objectFit: "contain", marginBottom: 8 }}
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
                fontFamily: "Cinzel",
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: -4,
              }}
            >
              {monograma[0]}
              {monograma[1]}
            </div>
          )}

          <div
            style={{
              fontFamily: "Italianno",
              fontSize: 92,
              color: OLIVE,
              lineHeight: 0.95,
              marginTop: 4,
              marginBottom: 18,
            }}
          >
            {primeiro} & {segundo}
          </div>

          <div
            style={{
              fontFamily: "Playfair",
              fontSize: 26,
              fontStyle: "italic",
              color: OLIVE,
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: 860,
              marginBottom: 10,
            }}
          >
            “{COLOSSENSES}”
          </div>

          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: OLIVE,
              marginBottom: 28,
            }}
          >
            Colossenses 3:14
          </div>

          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
              maxWidth: 900,
              marginBottom: 16,
            }}
          >
            Com as bênçãos de Deus
          </div>

          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: 1.8,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
              lineHeight: 1.45,
              maxWidth: 920,
            }}
          >
            {getDataHoraConviteUppercase()}
          </div>

          <div
            style={{
              fontFamily: "Cinzel",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: OLIVE,
              textAlign: "center",
              marginTop: 10,
              opacity: 0.92,
            }}
          >
            {EVENTO.local.nome} · {EVENTO.local.cidade}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
