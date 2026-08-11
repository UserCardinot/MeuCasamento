/**
 * Gera JPGs de teste com DateTimeOriginal (EXIF) para validar as pastas do evento.
 *
 * Uso:
 *   node scripts/gerar-fotos-teste-exif.mjs
 *   node scripts/gerar-fotos-teste-exif.mjs 2026-09-26
 *
 * Saída: pasta tmp/fotos-teste-exif/
 */

import fs from "fs";
import path from "path";
import piexif from "piexifjs";

const eventDate = (process.argv[2] || "2026-09-26").trim(); // YYYY-MM-DD

/** JPEG 1x1 pixel mínimo (base64) */
const MINI_JPEG_B64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z";

function toExifDate(isoDate, hhmmss) {
  const [y, m, d] = isoDate.split("-");
  return `${y}:${m}:${d} ${hhmmss}`;
}

function buildJpegWithExif(dateTimeOriginal) {
  const dataUrl = "data:image/jpeg;base64," + MINI_JPEG_B64;
  const zeroth = {};
  const exif = {};
  zeroth[piexif.ImageIFD.DateTime] = dateTimeOriginal;
  exif[piexif.ExifIFD.DateTimeOriginal] = dateTimeOriginal;
  exif[piexif.ExifIFD.DateTimeDigitized] = dateTimeOriginal;
  const exifBytes = piexif.dump({ "0th": zeroth, Exif: exif, GPS: {}, "1st": {}, thumbnail: null });
  const inserted = piexif.insert(exifBytes, dataUrl);
  const b64 = inserted.replace(/^data:image\/jpeg;base64,/, "");
  return Buffer.from(b64, "base64");
}

const casos = [
  { nome: "01-recepcao-08h30.jpg", hora: "08:30:00", esperado: "Recepcao" },
  { nome: "02-cerimonia-09h45.jpg", hora: "09:45:00", esperado: "Cerimonia" },
  { nome: "03-cafe-11h00.jpg", hora: "11:00:00", esperado: "Cafe" },
];

const outDir = path.join(process.cwd(), "tmp", "fotos-teste-exif");
fs.mkdirSync(outDir, { recursive: true });

for (const c of casos) {
  const dt = toExifDate(eventDate, c.hora);
  const buf = buildJpegWithExif(dt);
  const dest = path.join(outDir, c.nome);
  fs.writeFileSync(dest, buf);
  console.log(`OK  ${c.nome}  EXIF=${dt}  → pasta esperada: ${c.esperado}`);
}

const semExif = path.join(outDir, "04-outros-sem-exif.jpg");
fs.writeFileSync(semExif, Buffer.from(MINI_JPEG_B64, "base64"));
console.log(`OK  04-outros-sem-exif.jpg  (sem EXIF)  → pasta esperada: Outros`);

console.log(`\nArquivos em: ${outDir}`);
console.log("Envie cada um em /midia?eventToken=... e confira o Drive.");
