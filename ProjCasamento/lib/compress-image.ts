/** Compacta imagem no browser para caber no limite da Vercel (~4,5 MB). */

const MAX_EDGE = 1920;
const TARGET_BYTES = 3.2 * 1024 * 1024;
const QUALITIES = [0.82, 0.72, 0.62, 0.52];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao compactar."))),
      type,
      quality
    );
  });
}

/**
 * Redimensiona e converte para JPEG se necessário.
 * Retorna o arquivo original se já for pequeno o bastante e for JPEG/WebP/PNG.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // GIF animado: não compactar via canvas
  if (file.type === "image/gif") return file;
  if (file.size <= TARGET_BYTES && (file.type === "image/jpeg" || file.type === "image/webp")) {
    return file;
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, w, h);

  let best: Blob | null = null;
  for (const q of QUALITIES) {
    const blob = await canvasToBlob(canvas, "image/jpeg", q);
    best = blob;
    if (blob.size <= TARGET_BYTES) break;
  }

  if (!best) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "foto";
  return new File([best], `${base}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
