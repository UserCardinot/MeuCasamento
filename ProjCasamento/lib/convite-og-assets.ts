import { readFile } from "fs/promises";
import { join } from "path";
import { getPublicSiteBaseUrl } from "@/lib/mercadopago-shared";

const LOGO_PATH = process.env.NEXT_PUBLIC_CONVITE_LOGO?.trim() || "/convite/logo.png";
const CAPA_PATH = process.env.NEXT_PUBLIC_CONVITE_CAPA?.trim() || "/convite/capa.png";

function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "image/png";
}

async function readLocalPublicImage(relativePath: string): Promise<string | null> {
  const normalized = relativePath.replace(/^\//, "");
  const filePath = join(process.cwd(), "public", ...normalized.split("/"));
  try {
    const buf = await readFile(filePath);
    return `data:${mimeFromPath(normalized)};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function fetchRemoteImageAsDataUrl(relativePath: string): Promise<string | null> {
  const base = getPublicSiteBaseUrl();
  if (!base || base.includes("localhost")) return null;

  const url = `${base}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || mimeFromPath(relativePath);
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function loadConviteLogoDataUrl(): Promise<string | null> {
  return (await readLocalPublicImage(LOGO_PATH)) ?? (await fetchRemoteImageAsDataUrl(LOGO_PATH));
}

export async function loadConviteCapaDataUrl(): Promise<string | null> {
  return (await readLocalPublicImage(CAPA_PATH)) ?? (await fetchRemoteImageAsDataUrl(CAPA_PATH));
}
