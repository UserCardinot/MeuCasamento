import { getPublicSiteBaseUrl } from "@/lib/mercadopago-shared";

const LOGO_PATH = process.env.NEXT_PUBLIC_CONVITE_LOGO?.trim() || "/convite/logo.png";
const CAPA_PATH = process.env.NEXT_PUBLIC_CONVITE_CAPA?.trim() || "/convite/capa.png";

function toAbsolute(path: string): string {
  const base = getPublicSiteBaseUrl().replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

export function getConviteLogoAbsoluteUrl(): string {
  return toAbsolute(LOGO_PATH);
}

export function getConviteCapaAbsoluteUrl(): string {
  return toAbsolute(CAPA_PATH);
}

export function getConviteOgImageAbsoluteUrl(): string {
  return toAbsolute("/api/og/convite");
}
