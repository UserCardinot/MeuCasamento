/**
 * Rate limit simples por IP (em memória)
 * Limite: 30 requisições por minuto por IP
 */

const limit = 30;
const windowMs = 60 * 1000; // 1 minuto

const requests = new Map<string, { count: number; resetAt: number }>();

function cleanup() {
  const now = Date.now();
  for (const [ip, data] of requests.entries()) {
    if (data.resetAt < now) requests.delete(ip);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  cleanup();

  const now = Date.now();
  const record = requests.get(ip);

  if (!record) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.resetAt < now) {
    requests.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  record.count++;
  const remaining = Math.max(0, limit - record.count);
  const allowed = record.count <= limit;

  return { allowed, remaining };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}
