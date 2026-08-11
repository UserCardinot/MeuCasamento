/** Lê DateTimeOriginal no browser (antes de compactar a foto). */

import exifr from "exifr";

/** Formato aceito pelo servidor: "YYYY:MM:DD HH:mm:ss" */
export async function readCaptureHint(file: File): Promise<string | null> {
  try {
    const meta = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
      reviveValues: false,
    });
    if (!meta || typeof meta !== "object") return null;
    const record = meta as Record<string, unknown>;
    for (const key of ["DateTimeOriginal", "CreateDate", "ModifyDate"]) {
      const raw = record[key];
      if (raw == null) continue;
      const str = String(raw).trim();
      const m = str.match(
        /^(\d{4})[:\-](\d{2})[:\-](\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
      );
      if (m) {
        const sec = m[6] ?? "00";
        return `${m[1]}:${m[2]}:${m[3]} ${m[4]}:${m[5]}:${sec}`;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}
