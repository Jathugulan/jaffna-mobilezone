export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: unknown;

  constructor(statusCode: number, message: string, code?: string, errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? this.defaultCode(statusCode);
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  private defaultCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "VALIDATION_ERROR";
      case 429:
        return "TOO_MANY_REQUESTS";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}

export function notFound(msg = "Resource not found"): ApiError {
  return new ApiError(404, msg, "NOT_FOUND");
}

export function badRequest(msg: string, errors?: unknown): ApiError {
  return new ApiError(400, msg, "BAD_REQUEST", errors);
}

export function conflict(msg: string): ApiError {
  return new ApiError(409, msg, "CONFLICT");
}

export function forbidden(msg = "You do not have permission"): ApiError {
  return new ApiError(403, msg, "FORBIDDEN");
}

export function unauthorized(msg = "Authentication required"): ApiError {
  return new ApiError(401, msg, "UNAUTHORIZED");
}