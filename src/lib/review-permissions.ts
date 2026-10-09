import type { Role } from "@/components/providers/role-context";
import type { ReviewFixture } from "./review-types";

// Frontend-only permission model for prototype review. Replace with server-authorized access later.
export function canAct(review: ReviewFixture, role: Role) {
  return review.status !== "Completed" && review.status !== "Needs Information" && review.authority === role;
}

export function requiredReviewerMessage(review: ReviewFixture, role: Role) {
  if (review.status === "Completed") return "This review is completed and is read-only.";
  if (review.status === "Needs Information") return "Information has been requested. This review is awaiting a response.";
  if (review.proposedOverride?.submittedByRole === role && review.approval.required) return `Override submitted. ${review.authority} approval is required.`;
  if (canAct(review, role)) return "You are the required reviewer for this decision.";
  return `${review.authority} action required.`;
}
