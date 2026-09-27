type LogLevel = "info" | "warn" | "error" | "debug" | "audit";

interface LogPayload {
  message: string;
  requestId?: string;
  organizationId?: string;
  context?: Record<string, unknown>;
  error?: Error | string | unknown;
}

class Logger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const logObj: Record<string, unknown> = {
      timestamp,
      level,
      message: payload.message,
    };

    if (payload.requestId) logObj.requestId = payload.requestId;
    if (payload.organizationId) logObj.organizationId = payload.organizationId;
    if (payload.context) logObj.context = payload.context;
    if (payload.error) {
      logObj.error = payload.error instanceof Error ? payload.error.message : String(payload.error);
    }

    return JSON.stringify(logObj);
  }

  info(message: string, context?: Record<string, unknown>, requestId?: string, organizationId?: string) {
    console.log(this.formatLog("info", { message, context, requestId, organizationId }));
  }

  warn(message: string, context?: Record<string, unknown>, requestId?: string, organizationId?: string) {
    console.warn(this.formatLog("warn", { message, context, requestId, organizationId }));
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>, requestId?: string, organizationId?: string) {
    console.error(this.formatLog("error", { message, error, context, requestId, organizationId }));
  }

  audit(action: string, entity: string, entityId: string, organizationId: string, changes?: Record<string, unknown>) {
    console.log(
      this.formatLog("audit", {
        message: `AUDIT: ${action} on ${entity} (${entityId})`,
        organizationId,
        context: { action, entity, entityId, changes },
      })
    );
  }

  async traceQuery<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      if (durationMs > 200) {
        this.warn(`SLOW_QUERY: ${name} took ${durationMs}ms`);
      }
      return result;
    } catch (err) {
      this.error(`QUERY_FAILED: ${name}`, err);
      throw err;
    }
  }
}

export const logger = new Logger();
