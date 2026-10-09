export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status?: number, public readonly retryable = false, public readonly requestId?: string) { super(message); this.name = "ApiError"; }
}

export function isApiError(error: unknown): error is ApiError { return error instanceof ApiError; }
