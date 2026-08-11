/**
 * Classifica fotos por momento do evento com base no EXIF (hora de captura),
 * não no horário de upload.
 */

import exifr from "exifr";

export type PhotoMomento = "cerimonia" | "recepcao" | "cafe" | "outros";

export type PhotoMomentResult = {
  folderId: string;
  momento: PhotoMomento;
};

type Segmento = {
  momento: Exclude<PhotoMomento, "outros">;
  inicioMinutos: number;
};

function parseHhMm(value: string | undefined): number | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** EXIF costuma vir como "2026:09:26 09:30:00" (sem fuso). */
function parseExifLocal(raw: unknown): { date: string; minutos: number } | null {
  if (raw == null) return null;

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    // Só usamos se reviveValues criou Date; preferimos componentes em UTC
    // quando a lib interpreta a string "naive" como UTC.
    const y = raw.getUTCFullYear();
    const mo = String(raw.getUTCMonth() + 1).padStart(2, "0");
    const d = String(raw.getUTCDate()).padStart(2, "0");
    const h = raw.getUTCHours();
    const mi = raw.getUTCMinutes();
    return { date: `${y}-${mo}-${d}`, minutos: h * 60 + mi };
  }

  const str = String(raw).trim();
  const m = str.match(
    /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) return null;
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    minutos: Number(m[4]) * 60 + Number(m[5]),
  };
}

export async function extractCaptureLocal(
  buffer: Buffer
): Promise<{ date: string; minutos: number } | null> {
  try {
    const meta = await exifr.parse(buffer, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      reviveValues: false,
    });
    if (!meta || typeof meta !== "object") return null;

    const record = meta as Record<string, unknown>;
    for (const key of ["DateTimeOriginal", "CreateDate", "ModifyDate"]) {
      const parsed = parseExifLocal(record[key]);
      if (parsed) return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function resolveMomento(
  capture: { date: string; minutos: number } | null
): PhotoMomento {
  const eventDate = process.env.EVENT_DATE?.trim();
  if (!capture || !eventDate || capture.date !== eventDate) {
    return "outros";
  }

  const segmentos: Segmento[] = (
    [
      {
        momento: "cerimonia" as const,
        inicioMinutos: parseHhMm(process.env.EVENT_CERIMONIA_INICIO) ?? -1,
      },
      {
        momento: "recepcao" as const,
        inicioMinutos: parseHhMm(process.env.EVENT_RECEPCAO_INICIO) ?? -1,
      },
      {
        momento: "cafe" as const,
        inicioMinutos: parseHhMm(process.env.EVENT_CAFE_INICIO) ?? -1,
      },
    ] satisfies Segmento[]
  ).filter((s) => s.inicioMinutos >= 0);

  segmentos.sort((a, b) => a.inicioMinutos - b.inicioMinutos);

  let escolhido: PhotoMomento = "outros";
  for (const seg of segmentos) {
    if (capture.minutos >= seg.inicioMinutos) {
      escolhido = seg.momento;
    }
  }
  return escolhido;
}

function folderIdForMomento(momento: PhotoMomento): string | undefined {
  const map: Record<PhotoMomento, string | undefined> = {
    cerimonia: process.env.GOOGLE_DRIVE_FOLDER_CERIMONIA,
    recepcao: process.env.GOOGLE_DRIVE_FOLDER_RECEPCAO,
    cafe: process.env.GOOGLE_DRIVE_FOLDER_CAFE,
    outros: process.env.GOOGLE_DRIVE_FOLDER_OUTROS,
  };
  return map[momento]?.trim() || undefined;
}

/**
 * Resolve pasta do Drive e rótulo do momento a partir do buffer da foto.
 * `captureHint` (opcional): data/hora lida no cliente antes da compressão (EXIF se perde no canvas).
 * Fallback: Outros (sem EXIF, fora do dia, antes do primeiro segmento).
 */
export async function resolvePhotoUpload(
  buffer: Buffer,
  captureHint?: string | null
): Promise<PhotoMomentResult> {
  const fromHint = captureHint ? parseExifLocal(captureHint) : null;
  const capture = fromHint || (await extractCaptureLocal(buffer));
  const momento = resolveMomento(capture);

  const folderId =
    folderIdForMomento(momento) ||
    folderIdForMomento("outros") ||
    process.env.GOOGLE_DRIVE_FOLDER_FOTOS?.trim();

  if (!folderId) {
    throw new Error(
      "Configure GOOGLE_DRIVE_FOLDER_CERIMONIA/RECEPCAO/CAFE/OUTROS (ou FOTOS)"
    );
  }

  return { folderId, momento };
}
