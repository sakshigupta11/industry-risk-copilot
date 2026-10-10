import type { Role } from "@/components/providers/role-context";
import type { IndustryCategory, IndustryRisk } from "./industry-taxonomy";

export type ReviewRisk = "Low" | "Medium" | "High" | "Prohibited" | "Not assigned";
export type ReviewStatus = "Decision Ready" | "Analyst Review" | "Classification Review" | "Senior Review" | "Specialist Escalation" | "Needs Information" | "Completed";
export type ReviewAuthority = Role;
export type ApprovalStatus = "NOT_REQUIRED" | "PENDING_SENIOR_APPROVAL" | "PENDING_SPECIALIST_APPROVAL" | "APPROVED" | "REJECTED" | "MODIFIED_AND_APPROVED";
export type WorkflowContext = "STANDARD_REVIEW" | "CLASSIFICATION_RESOLUTION" | "OVERRIDE_APPROVAL" | "PROHIBITED_OVERRIDE_APPROVAL";
export type DecisionSource = "AI_ACCEPTED" | "DIRECT_OVERRIDE" | "APPROVED_OVERRIDE" | "CHECKER_MODIFIED";
export type ReviewAction = "accept" | "override" | "resolve-classification" | "request-info" | "escalate" | "approve-override" | "reject-override" | "modify-decision" | "approve-resolution" | "reject-resolution" | "modify-resolution";
export type ReviewEvent = { id: string; time: string; title: string; detail: string };
export type OverrideProposal = IndustryCategory & { reason: string; notes?: string; submittedByRole: Role; submittedAt: string };
export type Approval = { required: boolean; requiredRole: ReviewAuthority | null; status: ApprovalStatus; checkerRole?: Role; checkerAction?: "approved" | "rejected" | "modified"; checkerReason?: string; checkerAt?: string };
export type FinalDecision = IndustryCategory & { decidedByRole: Role; decidedAt: string; decisionSource: DecisionSource };

// Transitional UI contract. Step 2 replaces local instances with API-derived ReviewDetail mappings.
export type ReviewFixture = {
  id: string; company: string; category: string; risk: ReviewRisk; confidence: number; status: ReviewStatus; authority: ReviewAuthority; updated: string; updatedExact?: string; submitted: string; documentName: string; website?: string;
  aiRecommendation: IndustryCategory & { confidence: number };
  proposedOverride?: OverrideProposal; approval: Approval; finalDecision?: FinalDecision; workflowContext: WorkflowContext; history: ReviewEvent[];
  allowedActions?: string[]; lastAction?: ReviewAction; lastActionReason?: string; lastActionAt?: string;
  companySummary?: string; currentBusinessActivity?: string; futureOrPlannedActivity?: string; evidence?: string;
  materialCandidates?: string; materialityUnclearCandidates?: string; supportingCandidates?: string;
  missingInformation?: string; conflictingInformation?: string; classificationCriticalGap?: boolean | null; classificationCriticalGapReason?: string;
  confidenceReason?: string; tieResolution?: string; tieResolutionReason?: string;
  classificationOutcomeType?: "CONFIRMED_CATEGORY" | "NO_APPLICABLE_CATEGORY" | "INSUFFICIENT_EVIDENCE" | "UNRESOLVED_TIE" | null;
};

export type { IndustryRisk };
