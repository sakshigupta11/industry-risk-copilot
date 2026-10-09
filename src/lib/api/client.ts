import { ApiError } from "./errors";
import type { ApiEnvelope } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_FINCRIME_API_BASE_URL ?? "/api";

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${apiBaseUrl.replace(/\/$/, "")}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => { if (value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestInit & { query?: Record<string, string | number | undefined> } = {}): Promise<{ data: T; warnings: string[] }> {
  const { query, headers, ...init } = options;
  let response: Response;
  try { response = await fetch(buildUrl(path, query), { ...init, headers: { Accept: "application/json", ...headers } }); }
  catch { throw new ApiError("NETWORK_ERROR", "Unable to reach the review service. Check your connection and try again.", undefined, true); }
  let body: ApiEnvelope<T> | undefined;
  try { body = await response.json() as ApiEnvelope<T>; }
  catch { throw new ApiError("INVALID_RESPONSE", "The review service returned an unreadable response.", response.status, response.status >= 500); }
  if (!response.ok || !body.success || body.error) throw new ApiError(body.error?.code ?? `HTTP_${response.status}`, body.error?.message ?? "The request could not be completed.", response.status, body.error?.retryable ?? response.status >= 500, body.error?.request_id);
  const data = body.data ?? body.review as T | undefined;
  if (data === undefined) throw new ApiError("MISSING_DATA", "The review service returned no data.", response.status);
  return { data, warnings: body.warnings ?? [] };
}

export async function apiReviewRequest(path: string, options: RequestInit = {}) {
  const { data, warnings } = await apiRequest<import("./types").ReviewDetail>(path, options);
  return { review: data, warnings };
}
