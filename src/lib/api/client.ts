import { ApiError } from "./errors";
import type { ApiEnvelope } from "./types";

// Keep browser requests off the conventional `/api` prefix. Some client-side
// blockers intercept that prefix; Next rewrites this path to the internal API.
const apiBaseUrl = process.env.NEXT_PUBLIC_FINCRIME_API_BASE_URL ?? "/workspace-data";

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
  const data = (body.data ?? body.review ?? body) as T | undefined;
  if (data === undefined) throw new ApiError("MISSING_DATA", "The review service returned no data.", response.status);
  return { data, warnings: body.warnings ?? [] };
}

export async function apiReviewRequest(path: string, options: RequestInit = {}) {
  const { data, warnings } = await apiRequest<import("./types").ReviewDetail>(path, options);
  const grouped = data as unknown as Record<string, unknown>;
  const review = grouped.identity ? (() => {
    const recommendation = grouped.ai_recommendation as Record<string, unknown>;
    const proposal = grouped.proposal as Record<string, unknown>;
    const approval = grouped.approval as Record<string, unknown>;
    const finalDecision = grouped.final_decision as Record<string, unknown>;
    const actionMap: Record<string, string> = {
      ACCEPT_RECOMMENDATION: "accept", SUBMIT_OVERRIDE: "override", REQUEST_INFORMATION: "request-information",
      MANUAL_ESCALATION: "escalate", APPROVE_OVERRIDE: "approve-override", REJECT_OVERRIDE: "reject-override",
      MODIFY_DECISION: "modify-decision", RESOLVE_CLASSIFICATION: "resolve-classification",
      APPROVE_RESOLUTION: "approve-resolution", REJECT_RESOLUTION: "reject-resolution", MODIFY_RESOLUTION: "modify-resolution",
    };
    return {
      ...(grouped.identity as object), ...(grouped.analysis as object), ...recommendation,
      ...(grouped.workflow as object), ...(grouped.processing as object), ...(grouped.versions as object),
      ai_recommendation: {
        taxonomy_value: recommendation.final_taxonomy_value,
        sector: recommendation.final_industry_sector,
        category: recommendation.final_industry_category,
        risk: recommendation.policy_risk,
        confidence: recommendation.confidence,
        confidence_reason: recommendation.confidence_reason,
      },
      proposed_override: proposal?.proposed_category ? {
        taxonomy_value: proposal.proposed_taxonomy_value, sector: proposal.proposed_sector,
        category: proposal.proposed_category, risk: proposal.proposed_risk,
        reason: proposal.proposed_override_reason, notes: proposal.proposed_notes,
        proposed_by_role: proposal.proposed_by_role, proposed_by_name: proposal.proposed_by_name,
        proposed_by_email: proposal.proposed_by_email, proposed_at: proposal.proposed_at,
      } : undefined,
      approval: approval?.approval_status ? {
        required: Boolean(approval.approval_required), required_role: approval.approval_role,
        status: approval.approval_status, checker_action: approval.checker_action,
        checker_reason: approval.checker_reason, checker_role: approval.checker_role,
        checker_name: approval.checker_name, checker_email: approval.checker_email, checker_at: approval.checker_at,
      } : { required: false, required_role: null, status: "NOT_REQUIRED" },
      final_decision: finalDecision?.final_decision_category ? {
        taxonomy_value: finalDecision.final_decision_taxonomy_value, sector: finalDecision.final_decision_sector,
        category: finalDecision.final_decision_category, risk: finalDecision.final_decision_risk,
        decision_source: finalDecision.final_decision_source, finalized_by_role: finalDecision.finalized_by_role,
        finalized_by_name: finalDecision.finalized_by_name, finalized_by_email: finalDecision.finalized_by_email,
        finalized_at: finalDecision.finalized_at,
      } : undefined,
      history: grouped.history ?? [],
      allowed_actions: Array.isArray(grouped.allowed_actions)
        ? grouped.allowed_actions.map((action) => actionMap[String(action)] ?? action) : [],
    } as import("./types").ReviewDetail;
  })() : data;
  return { review, warnings };
}
