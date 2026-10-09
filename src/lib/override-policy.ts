import type { Role } from "@/components/providers/role-context";
import type { IndustryRisk } from "./industry-taxonomy";
import type { ReviewAuthority, ReviewStatus, WorkflowContext } from "./review-types";

export type OverrideOutcome = {
  mayFinalize: boolean;
  approvalRequired: boolean;
  requiredRole: ReviewAuthority | null;
  status: ReviewStatus;
  authority: ReviewAuthority;
  workflowContext: WorkflowContext;
  ctaLabel: string;
  explanation: string;
};

export const riskOrder: Record<IndustryRisk, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, PROHIBITED: 3 };
export const riskLabel = (risk: IndustryRisk) => risk.charAt(0) + risk.slice(1).toLowerCase();
export const isProhibitedPath = (original: IndustryRisk, proposed: IndustryRisk) => original === "PROHIBITED" || proposed === "PROHIBITED";

export function getOverrideOutcome(role: Role, originalRisk: IndustryRisk, proposedRisk: IndustryRisk): OverrideOutcome {
  if (role === "Escalation Specialist") return { mayFinalize: true, approvalRequired: false, requiredRole: null, status: "Completed", authority: role, workflowContext: "STANDARD_REVIEW", ctaLabel: "Confirm Override", explanation: "Specialist authority can finalize this override." };
  if (isProhibitedPath(originalRisk, proposedRisk)) return { mayFinalize: false, approvalRequired: true, requiredRole: "Escalation Specialist", status: "Specialist Escalation", authority: "Escalation Specialist", workflowContext: "PROHIBITED_OVERRIDE_APPROVAL", ctaLabel: "Submit for Specialist Review", explanation: "Any decision involving Prohibited activity requires Escalation Specialist approval." };
  if (role === "Senior FinCrime Reviewer") return { mayFinalize: true, approvalRequired: false, requiredRole: null, status: "Completed", authority: role, workflowContext: "STANDARD_REVIEW", ctaLabel: "Confirm Override", explanation: "Senior FinCrime Reviewer authority can finalize Low, Medium, and High overrides." };
  const samePermittedTier = (originalRisk === "LOW" && proposedRisk === "LOW") || (originalRisk === "MEDIUM" && proposedRisk === "MEDIUM");
  if (samePermittedTier) return { mayFinalize: true, approvalRequired: false, requiredRole: null, status: "Completed", authority: role, workflowContext: "STANDARD_REVIEW", ctaLabel: "Confirm Override", explanation: "This same-tier Low or Medium override can be finalized by Tier 1." };
  return { mayFinalize: false, approvalRequired: true, requiredRole: "Senior FinCrime Reviewer", status: "Senior Review", authority: "Senior FinCrime Reviewer", workflowContext: "OVERRIDE_APPROVAL", ctaLabel: "Submit for Senior Review", explanation: "This risk-tier change requires independent Senior FinCrime Reviewer approval." };
}

export function canApproveOverride(role: Role, requiredRole: ReviewAuthority | null) { return role === requiredRole; }
export function canModifyDecision(role: Role) { return role === "Senior FinCrime Reviewer" || role === "Escalation Specialist"; }
