/**
 * Idempotency Engine for preventing duplicate executions from double-clicks,
 * retries, or network interruptions.
 */

interface IdempotencyRecord<T = unknown> {
  key: string;
  result: T;
  createdAt: number;
  expiresAt: number;
}

const idempotencyCache = new Map<string, IdempotencyRecord>();
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function buildIdempotencyKey(
  organizationId: string,
  operationType: string,
  clientRequestId: string
): string {
  const cleanOrg = organizationId.trim();
  const cleanOp = operationType.trim().toUpperCase();
  const cleanReq = clientRequestId.trim();
  return `${cleanOrg}:${cleanOp}:${cleanReq}`;
}

export function getIdempotentResult<T = unknown>(key: string): T | null {
  const record = idempotencyCache.get(key);
  if (!record) return null;

  if (Date.now() > record.expiresAt) {
    idempotencyCache.delete(key);
    return null;
  }

  return record.result as T;
}

export function setIdempotentResult<T = unknown>(
  key: string,
  result: T,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const now = Date.now();
  idempotencyCache.set(key, {
    key,
    result,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
}

export async function executeIdempotentOperation<T = unknown>(
  key: string,
  operation: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<{ result: T; isCached: boolean }> {
  const cached = getIdempotentResult<T>(key);
  if (cached !== null) {
    return { result: cached, isCached: true };
  }

  const result = await operation();
  setIdempotentResult(key, result, ttlMs);
  return { result, isCached: false };
}

export function clearIdempotencyCache(): void {
  idempotencyCache.clear();
}
