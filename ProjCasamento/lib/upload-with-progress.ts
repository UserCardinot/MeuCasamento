/** Upload com progresso de bytes (XHR). O fetch não expõe % de envio. */

export type UploadProgress = {
  loaded: number;
  total: number;
  /** 0–100 do corpo enviado ao servidor */
  percent: number;
};

export type UploadResult = {
  ok: boolean;
  status: number;
  data: { erro?: string; sucesso?: boolean; momento?: string; tipo?: string };
};

function parseXhrJson(xhr: XMLHttpRequest): UploadResult["data"] {
  try {
    return JSON.parse(xhr.responseText) as UploadResult["data"];
  } catch {
    if (xhr.status === 0) {
      return {
        erro:
          "Conexão interrompida. No celular, mantenha a tela ligada e o app do navegador aberto até terminar.",
      };
    }
    if (xhr.status === 413) {
      return { erro: "Arquivo grande demais para o servidor." };
    }
    return { erro: "Falha no envio. Tente de novo." };
  }
}

function attachProgress(
  xhr: XMLHttpRequest,
  onProgress?: (p: UploadProgress) => void
) {
  let lastPct = -1;
  let lastAt = 0;

  xhr.upload.onprogress = (e) => {
    if (!e.lengthComputable || e.total <= 0 || !onProgress) return;
    const percent = Math.min(100, Math.round((e.loaded / e.total) * 100));
    const now = Date.now();
    // Evita travar a UI com milhares de setState em vídeos de 1GB+
    if (percent !== 100 && percent === lastPct) return;
    if (percent !== 100 && percent - lastPct < 1 && now - lastAt < 400) return;
    lastPct = percent;
    lastAt = now;
    onProgress({ loaded: e.loaded, total: e.total, percent });
  };

  xhr.upload.onload = () => {
    onProgress?.({ loaded: 1, total: 1, percent: 100 });
  };
}

export function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    attachProgress(xhr, onProgress);

    xhr.onload = () => {
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data: parseXhrJson(xhr),
      });
    };

    xhr.onerror = () =>
      resolve({
        ok: false,
        status: 0,
        data: parseXhrJson(xhr),
      });
    xhr.ontimeout = () =>
      resolve({
        ok: false,
        status: 0,
        data: {
          erro: "Tempo esgotado. Mantenha a tela ligada e tente de novo no Wi‑Fi.",
        },
      });
    xhr.timeout = 0;
    xhr.send(formData);
  });
}

/**
 * Envia o arquivo cru (sem multipart). Melhor para vídeos grandes:
 * menos RAM no servidor e progresso mais estável.
 */
export function uploadRawFileWithProgress(
  url: string,
  file: Blob,
  headers: Record<string, string>,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    for (const [k, v] of Object.entries(headers)) {
      if (v != null && v !== "") xhr.setRequestHeader(k, v);
    }
    attachProgress(xhr, onProgress);

    xhr.onload = () => {
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        data: parseXhrJson(xhr),
      });
    };

    xhr.onerror = () =>
      resolve({
        ok: false,
        status: 0,
        data: parseXhrJson(xhr),
      });
    xhr.ontimeout = () =>
      resolve({
        ok: false,
        status: 0,
        data: {
          erro: "Tempo esgotado. Mantenha a tela ligada e tente de novo no Wi‑Fi.",
        },
      });
    xhr.timeout = 0;
    xhr.send(file);
  });
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/** Mantém a tela ligada durante o envio (quando o browser permite). */
export async function requestScreenWakeLock(): Promise<WakeLockSentinel | null> {
  try {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return null;
    return await navigator.wakeLock.request("screen");
  } catch {
    return null;
  }
}

export async function releaseScreenWakeLock(
  lock: WakeLockSentinel | null | undefined
): Promise<void> {
  try {
    await lock?.release();
  } catch {
    /* ignore */
  }
}
