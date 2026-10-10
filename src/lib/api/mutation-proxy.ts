import { NextResponse } from "next/server";

type ActionType = "ACCEPT_RECOMMENDATION" | "SUBMIT_OVERRIDE" | "APPROVE_OVERRIDE" | "REJECT_OVERRIDE" | "MODIFY_DECISION" | "REQUEST_INFORMATION" | "MANUAL_ESCALATION" | "RESOLVE_CLASSIFICATION" | "APPROVE_RESOLUTION" | "REJECT_RESOLUTION" | "MODIFY_RESOLUTION";

const unavailable = () => NextResponse.json({ success: false, error: { code: "BACKEND_UNAVAILABLE", message: "The review service is temporarily unavailable.", retryable: true } }, { status: 502 });

export async function proxyMutation(caseId: string, actionType: ActionType, request: Request) {
  const base = process.env.N8N_FINCRIME_WRITE_BASE_URL ?? process.env.N8N_FINCRIME_READ_BASE_URL;
  if (!base) return unavailable();
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "The action request is invalid.", retryable: false } }, { status: 400 }); }
  const target = new URL(`${base.replace(/\/$/, "")}/fincrime-v2/review-action`);
  const payload = { case_id: caseId, action_type: actionType, actor: body.actor, taxonomy_value: body.taxonomy_value, reason: body.reason, notes: body.notes, request_id: body.request_id };
  try {
    const response = await fetch(target, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(25_000) });
    const text = await response.text();
    let result: unknown;
    try { result = text ? JSON.parse(text) : {}; } catch { return unavailable(); }
    return NextResponse.json(result, { status: response.status });
  } catch (error) { console.error("Review action proxy failed", { actionType, caseId, error }); return unavailable(); }
}
