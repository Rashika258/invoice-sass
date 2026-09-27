export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_FAILED"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface StructuredErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export function createErrorResponse(
  error: unknown,
  requestId?: string
): { response: StructuredErrorResponse; statusCode: number } {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          requestId: requestId || `req_${Date.now()}`,
          ...(error.details ? { details: error.details } : {}),
        },
      },
    };
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";

  // Infer error code based on message keywords if generic Error
  let code: ErrorCode = "INTERNAL_ERROR";
  let statusCode = 500;

  if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("login")) {
    code = "UNAUTHENTICATED";
    statusCode = 401;
  } else if (message.toLowerCase().includes("permission") || message.toLowerCase().includes("forbidden")) {
    code = "FORBIDDEN";
    statusCode = 403;
  } else if (message.toLowerCase().includes("not found")) {
    code = "NOT_FOUND";
    statusCode = 404;
  } else if (message.toLowerCase().includes("conflict") || message.toLowerCase().includes("cannot transition")) {
    code = "CONFLICT";
    statusCode = 409;
  } else if (message.toLowerCase().includes("invalid") || message.toLowerCase().includes("required")) {
    code = "VALIDATION_ERROR";
    statusCode = 400;
  }

  return {
    statusCode,
    response: {
      success: false,
      error: {
        code,
        message,
        requestId: requestId || `req_${Date.now()}`,
      },
    },
  };
}
