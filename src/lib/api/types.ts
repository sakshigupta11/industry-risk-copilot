export type ReviewerRole = "Tier 1 Analyst" | "Senior FinCrime Reviewer" | "Escalation Specialist";
export type Risk = "LOW" | "MEDIUM" | "HIGH" | "PROHIBITED";
export type ProcessingStatus = "RECEIVED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type ReviewStatus = "Decision Ready" | "Analyst Review" | "Senior Review" | "Specialist Escalation" | "Needs Information" | "Completed";
export type WorkflowContext = "STANDARD_REVIEW" | "OVERRIDE_APPROVAL" | "PROHIBITED_OVERRIDE_APPROVAL";
export type AllowedAction = "accept" | "override" | "request-information" | "escalate" | "approve-override" | "reject-override" | "modify-decision";

export type TaxonomyCategory = { taxonomy_value: string; sector: string; category: string; risk: Risk; taxonomy_version: string };
export type AIRecommendation = { taxonomy_value?: string; sector?: string; category?: string; risk?: Risk; confidence: "LOW" | "MEDIUM" | "HIGH"; confidence_reason: string };
export type BusinessActivity = { activity: string; evidence_snippet: string; materiality: "MATERIAL_CURRENT" | "MATERIALITY_UNCLEAR" | "SUPPORTING_OR_INCIDENTAL"; materiality_reason?: string };
export type Conflict = { statement: string; severity: "MATERIAL_CONFLICT" | "CLARIFIED_OR_NON_MATERIAL"; conflict_resolution_reason: string };
export type OverrideProposal = TaxonomyCategory & { reason: string; notes?: string; proposed_by_role: ReviewerRole; proposed_by_name?: string; proposed_by_email?: string; proposed_at: string };
export type Approval = { required: boolean; required_role: "Senior FinCrime Reviewer" | "Escalation Specialist" | null; status: "NOT_REQUIRED" | "PENDING_SENIOR_APPROVAL" | "PENDING_SPECIALIST_APPROVAL" | "APPROVED" | "REJECTED" | "MODIFIED_AND_APPROVED"; checker_action?: "APPROVE" | "REJECT" | "MODIFY"; checker_reason?: string; checker_role?: ReviewerRole; checker_name?: string; checker_email?: string; checker_at?: string };
export type FinalDecision = TaxonomyCategory & { decision_source: "AI_ACCEPTED" | "DIRECT_OVERRIDE" | "APPROVED_OVERRIDE" | "CHECKER_MODIFIED"; finalized_by_role: ReviewerRole; finalized_by_name?: string; finalized_by_email?: string; finalized_at: string };
export type ReviewEvent = { event_id: string; case_id: string; event_timestamp: string; event_type: string; actor_name?: string; actor_email?: string; actor_role?: ReviewerRole; previous_status?: ReviewStatus; new_status?: ReviewStatus; previous_authority?: ReviewerRole; new_authority?: ReviewerRole; workflow_context?: WorkflowContext; previous_taxonomy_value?: string; previous_sector?: string; previous_category?: string; previous_risk?: Risk; new_taxonomy_value?: string; new_sector?: string; new_category?: string; new_risk?: Risk; action_reason?: string; action_notes?: string; approval_status?: string; event_detail?: string; workflow_version: string };

export type ReviewDetail = {
  case_id: string; timestamp: string; company_name?: string; source_pdf_filename: string; website?: string;
  submitted_by_name: string; submitted_by_email: string; submitted_by_role: ReviewerRole;
  company_summary?: string; current_business_activity?: string; future_or_planned_activity?: string;
  industry_candidates?: string; material_candidates?: string; materiality_unclear_candidates?: string; supporting_or_incidental_candidates?: string;
  final_industry_category?: string; final_industry_sector?: string; final_taxonomy_value?: string; policy_risk?: Risk; prohibited_flag?: boolean;
  confidence?: "LOW" | "MEDIUM" | "HIGH"; confidence_reason?: string; missing_information?: string; conflicting_information?: string; evidence?: string;
  classification_critical_gap?: boolean | null; classification_critical_gap_reason?: string; tie_resolution?: string; tie_resolution_reason?: string;
  review_status: ReviewStatus; review_reason?: string; decision_authority: ReviewerRole; workflow_context: WorkflowContext;
  ai_recommendation?: AIRecommendation; proposed_override?: OverrideProposal; approval?: Approval; final_decision?: FinalDecision;
  processing_status: ProcessingStatus; processing_error_code?: string; processing_error_message?: string; processing_error_retryable?: boolean;
  model_version?: string; prompt_version?: string; taxonomy_version?: string; policy_version?: string; classifier_workflow_version?: string; workflow_version: string;
  history: ReviewEvent[]; allowed_actions: AllowedAction[]; last_updated_at: string;
};

export type ReviewListItem = Pick<ReviewDetail, "case_id" | "company_name" | "final_industry_category" | "policy_risk" | "confidence" | "review_status" | "decision_authority" | "workflow_context" | "last_updated_at" | "allowed_actions">;
export type Pagination = { page: number; page_size: number; total: number };
export type ReviewListResponse = { reviews: ReviewListItem[]; pagination: Pagination };
export type ApiEnvelope<T> = { success: boolean; data?: T; review?: ReviewDetail; warnings?: string[]; error?: { code: string; message: string; retryable?: boolean; request_id?: string } };

export type ReviewQuery = { status?: ReviewStatus; authority?: ReviewerRole; risk?: Risk; search?: string; page?: number; page_size?: number; sort?: string; completed?: string };
export type Actor = { actor_name: string; actor_email: string; actor_role: ReviewerRole };
export type AcceptInput = Actor & { reason?: string };
export type CreateReviewInput = { file: File; website?: string; submitted_by_name: string; submitted_by_email: string; submitted_by_role: ReviewerRole };
export type OverrideInput = Actor & TaxonomyCategory & { reason: string; notes?: string };
export type CheckerReasonInput = Actor & { reason: string };
export type ModifyDecisionInput = Actor & TaxonomyCategory & { reason: string; notes?: string };
export type RequestInformationInput = Actor & { reason: string; notes?: string };
export type EscalateInput = Actor & { reason: string; notes?: string };
