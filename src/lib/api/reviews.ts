import { apiRequest, apiReviewRequest } from "./client";
import type { AcceptInput, CheckerReasonInput, CreateReviewInput, EscalateInput, ModifyDecisionInput, OverrideInput, RequestInformationInput, ReviewDetail, ReviewListResponse, ReviewQuery } from "./types";

const json = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export async function getReviews(query: ReviewQuery = {}) { return apiRequest<ReviewListResponse>("/reviews", { query }); }
export async function getReview(caseId: string) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}`); }
export async function acceptRecommendation(caseId: string, input: AcceptInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/accept`, json(input)); }
export async function submitOverride(caseId: string, input: OverrideInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/overrides`, json(input)); }
export async function approveOverride(caseId: string, input: CheckerReasonInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/override-approval/approve`, json(input)); }
export async function rejectOverride(caseId: string, input: CheckerReasonInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/override-approval/reject`, json(input)); }
export async function modifyOverride(caseId: string, input: ModifyDecisionInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/override-approval/modify`, json(input)); }
export async function requestInformation(caseId: string, input: RequestInformationInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/request-information`, json(input)); }
export async function escalateReview(caseId: string, input: EscalateInput) { return apiReviewRequest(`/reviews/${encodeURIComponent(caseId)}/escalate`, json(input)); }

export async function createReview(input: CreateReviewInput): Promise<{ review: ReviewDetail; warnings: string[] }> {
  const formData = new FormData();
  formData.set("file", input.file); if (input.website) formData.set("website", input.website);
  formData.set("submitted_by_name", input.submitted_by_name); formData.set("submitted_by_email", input.submitted_by_email); formData.set("submitted_by_role", input.submitted_by_role);
  return apiReviewRequest("/reviews", { method: "POST", body: formData });
}
