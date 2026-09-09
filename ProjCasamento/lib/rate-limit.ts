/**
 * Rate limit simples por IP (em memória).
 * Padrão: 30 req/min. Passar `limit` para rotas de upload no dia do evento.
 */

const DEFAULT_LIMIT = 30;
const windowMs = 60 * 1000; // 1 minuto

const requests = new Map<string, { count: number; resetAt: number; limit: number }>();

function cleanup() {
  const now = Date.now();
  for (const [ip, data] of Array.from(requests.entries())) {
    if (data.resetAt < now) requests.delete(ip);
  }
}

export function checkRateLimit(
  ip: string,
  opts?: { limit?: number }
): { allowed: boolean; remaining: number } {
  cleanup();

  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const now = Date.now();
  const record = requests.get(ip);

  if (!record) {
    requests.set(ip, { count: 1, resetAt: now + windowMs, limit });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.resetAt < now) {
    requests.set(ip, { count: 1, resetAt: now + windowMs, limit });
    return { allowed: true, remaining: limit - 1 };
  }

  // Usa o maior teto visto nesta janela (ex.: mídia 300 vs outras 30)
  record.limit = Math.max(record.limit, limit);
  record.count++;
  const remaining = Math.max(0, record.limit - record.count);
  const allowed = record.count <= record.limit;

  return { allowed, remaining };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}
