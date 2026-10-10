"use client";

import { useEffect, useState } from "react";
import type { IndustryCategory } from "@/lib/industry-taxonomy";
import { getTaxonomy } from "@/lib/api/taxonomy";
import { toIndustryCategory } from "@/lib/api/mappers";
import { getOverrideOutcome, riskLabel } from "@/lib/override-policy";
import type { ReviewFixture } from "@/lib/review-types";
import type { Role } from "@/components/providers/role-context";

export type ReviewAction = "accept" | "override" | "resolve-classification" | "request-info" | "escalate" | "approve-override" | "reject-override" | "modify-decision" | "approve-resolution" | "reject-resolution" | "modify-resolution";
export type DialogSubmission = { action: ReviewAction; reason: string; notes?: string; category?: IndustryCategory };
type Props = { review: ReviewFixture; role: Role; action: ReviewAction | null; onClose: () => void; onSubmitted: (submission: DialogSubmission) => void; submitting?: boolean };

function useTaxonomyOptions() {
  const [categories, setCategories] = useState<IndustryCategory[]>([]);
  const [error, setError] = useState<string>();
  useEffect(() => { let active = true; void getTaxonomy().then(({ data }) => { if (active) setCategories(data.categories.map(toIndustryCategory)); }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load taxonomy."); }); return () => { active = false; }; }, []);
  return { categories, error, loading: !error && categories.length === 0 };
}

function Modal({ title, children, onClose, submitting }: { title: string; children: React.ReactNode; onClose: () => void; submitting?: boolean }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102a56]/30 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="w-full max-w-lg rounded-t-[10px] border border-border bg-surface shadow-2xl sm:rounded-[10px]"><div className="flex items-start justify-between border-b border-border p-5"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Review decision</p><h2 id="dialog-title" className="mt-2 text-lg font-semibold text-foreground">{title}</h2></div><button type="button" aria-label="Close dialog" disabled={submitting} onClick={onClose} className="size-8 rounded-md text-xl text-muted hover:bg-surface-muted disabled:opacity-60">×</button></div>{children}</div></div>;
}

function Footer({ label, onClose, disabled, submitting }: { label: string; onClose: () => void; disabled?: boolean; submitting?: boolean }) {
  return <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end"><button type="button" disabled={submitting} onClick={onClose} className="h-10 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60">Cancel</button><button type="submit" disabled={disabled || submitting} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-navy px-4 text-sm font-semibold !text-white hover:bg-navy-hover disabled:cursor-not-allowed disabled:bg-[#aab5c7]">{submitting && <span className="size-3 animate-spin rounded-full border-2 border-white/35 border-t-white" />}{submitting ? "Saving…" : label}</button></div>;
}

function CategoryPicker({ value, onChange, categories, disabled }: { value: string; onChange: (category: IndustryCategory) => void; categories: IndustryCategory[]; disabled?: boolean }) {
  const grouped = categories.reduce<Record<string, IndustryCategory[]>>((groups, item) => { (groups[item.sector] ??= []).push(item); return groups; }, {});
  return <label className="block text-sm font-semibold text-foreground">Category *<select disabled={disabled} value={value} onChange={(event) => { const category = categories.find((item) => item.value === event.target.value); if (category) onChange(category); }} className="mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm font-normal focus:border-accent focus:outline-none disabled:bg-surface-muted"><option value="">{disabled && !categories.length ? "Loading taxonomy…" : "Select an industry category"}</option>{Object.entries(grouped).map(([sector, items]) => <optgroup key={sector} label={sector}>{items.map((category) => <option key={category.value} value={category.value}>{category.category} — {riskLabel(category.risk)}</option>)}</optgroup>)}</select></label>;
}

function ReasonAndNotes({ reason, notes, setReason, setNotes, submitting, label = "Reason" }: { reason: string; notes?: string; setReason: (value: string) => void; setNotes?: (value: string) => void; submitting?: boolean; label?: string }) {
  return <><label className="block text-sm font-semibold text-foreground">{label} *<textarea disabled={submitting} value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-border p-3 text-sm font-normal focus:border-accent focus:outline-none disabled:bg-surface-muted" /></label>{setNotes && <label className="block text-sm font-semibold text-foreground">Reviewer notes <span className="font-normal text-muted">(optional)</span><textarea disabled={submitting} value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-2 w-full rounded-md border border-border p-3 text-sm font-normal focus:border-accent focus:outline-none disabled:bg-surface-muted" /></label>}</>;
}

function ReasonDialog({ title, label, action, onClose, onSubmitted, submitting }: { title: string; label: string; action: ReviewAction; onClose: () => void; onSubmitted: (submission: DialogSubmission) => void; submitting?: boolean }) {
  const [reason, setReason] = useState(""); const [attempted, setAttempted] = useState(false);
  return <Modal title={title} onClose={onClose} submitting={submitting}><form onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (reason.trim()) onSubmitted({ action, reason: reason.trim() }); }}><div className="space-y-3 p-5"><ReasonAndNotes reason={reason} setReason={setReason} submitting={submitting} />{attempted && !reason.trim() && <p className="text-xs text-[#a1322b]">A reason is required.</p>}</div><Footer label={label} onClose={onClose} submitting={submitting} /></form></Modal>;
}

function AcceptDialog({ onClose, onSubmitted, submitting }: Pick<Props, "onClose" | "onSubmitted" | "submitting">) {
  return <Modal title="Accept AI recommendation" onClose={onClose} submitting={submitting}><form onSubmit={(event) => { event.preventDefault(); onSubmitted({ action: "accept", reason: "" }); }}><div className="p-5"><p className="text-sm leading-6 text-muted">Accepting the recommendation will record the AI decision as final. No additional rationale is required.</p></div><Footer label="Accept Recommendation" onClose={onClose} submitting={submitting} /></form></Modal>;
}

function CategoryDecisionDialog({ review, role, action, onClose, onSubmitted, submitting }: Omit<Props, "action"> & { action: "override" | "resolve-classification" | "modify-decision" | "modify-resolution" }) {
  const { categories, error, loading } = useTaxonomyOptions(); const [value, setValue] = useState(""); const [category, setCategory] = useState<IndustryCategory>(); const [reason, setReason] = useState(""); const [notes, setNotes] = useState(""); const [attempted, setAttempted] = useState(false);
  const isResolution = action === "resolve-classification" || action === "modify-resolution"; const isModify = action === "modify-decision" || action === "modify-resolution"; const outcome = action === "override" && category ? getOverrideOutcome(role, review.aiRecommendation.risk, category.risk) : null;
  const candidates = (review.materialityUnclearCandidates ?? review.materialCandidates ?? "").split(/\s*\|\s*/).filter(Boolean);
  const title = action === "override" ? "Override recommendation" : action === "resolve-classification" ? "Resolve classification" : isResolution ? "Modify classification resolution" : "Modify decision";
  const label = action === "override" ? outcome?.ctaLabel ?? "Confirm Override" : action === "resolve-classification" ? "Resolve Classification" : isResolution ? "Confirm Classification" : "Confirm Decision";
  return <Modal title={title} onClose={onClose} submitting={submitting}><form onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (category && reason.trim()) onSubmitted({ action, category, reason: reason.trim(), notes: notes.trim() || undefined }); }}><div className="space-y-4 p-5">{action === "override" && <div className="rounded-lg border border-border bg-[#fbfcfd] p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">AI recommendation</p><p className="mt-1 font-semibold text-foreground">{review.aiRecommendation.category} · {riskLabel(review.aiRecommendation.risk)}</p></div>}{action === "resolve-classification" && <div className="rounded-lg border border-[#d7e2f5] bg-[#f4f7fd] p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#365b95]">AI-supported candidates</p>{candidates.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground">{candidates.map((candidate) => <li key={candidate}>{candidate}</li>)}</ul> : <p className="mt-1 text-muted">No confirmed category was returned. Select the most defensible taxonomy category.</p>}</div>}<p className="text-sm leading-5 text-muted">{isResolution ? "Choose a category and explain why the evidence supports it. The review service will decide whether approval is required." : isModify ? "Choose the final category. The review service will apply the appropriate policy." : "Choose a different category and explain the decision."}</p><CategoryPicker value={value} categories={categories} disabled={loading || Boolean(submitting)} onChange={(next) => { setValue(next.value); setCategory(next); }} />{error && <p className="text-xs text-[#a1322b]">{error}</p>}{category && action === "override" && <p className="rounded-md bg-[#fbfcfd] p-3 text-sm leading-5 text-muted">{outcome?.explanation}</p>}<ReasonAndNotes reason={reason} notes={notes} setReason={setReason} setNotes={setNotes} submitting={submitting} label={isResolution ? "Resolution reason" : isModify ? "Checker reason" : "Override reason"} />{attempted && (!category || !reason.trim()) && <p className="text-xs text-[#a1322b]">Select a category and provide a reason.</p>}</div><Footer label={label} onClose={onClose} disabled={loading || Boolean(error)} submitting={submitting} /></form></Modal>;
}

function RequestInfoDialog({ onClose, onSubmitted, submitting }: Pick<Props, "onClose" | "onSubmitted" | "submitting">) {
  const [reason, setReason] = useState(""); const [attempted, setAttempted] = useState(false);
  return <Modal title="Request more information" onClose={onClose} submitting={submitting}><form onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (reason.trim()) onSubmitted({ action: "request-info", reason: reason.trim() }); }}><div className="space-y-3 p-5"><ReasonAndNotes reason={reason} setReason={setReason} submitting={submitting} label="What additional information is required?" />{attempted && !reason.trim() && <p className="text-xs text-[#a1322b]">An information request is required.</p>}</div><Footer label="Request Information" onClose={onClose} submitting={submitting} /></form></Modal>;
}

function EscalateDialog({ onClose, onSubmitted, submitting }: Pick<Props, "onClose" | "onSubmitted" | "submitting">) {
  const [reason, setReason] = useState(""); const [attempted, setAttempted] = useState(false);
  return <Modal title="Escalate review" onClose={onClose} submitting={submitting}><form onSubmit={(event) => { event.preventDefault(); setAttempted(true); if (reason.trim()) onSubmitted({ action: "escalate", reason: reason.trim() }); }}><div className="space-y-3 p-5"><ReasonAndNotes reason={reason} setReason={setReason} submitting={submitting} label="Escalation reason" />{attempted && !reason.trim() && <p className="text-xs text-[#a1322b]">An escalation reason is required.</p>}</div><Footer label="Escalate Review" onClose={onClose} submitting={submitting} /></form></Modal>;
}

export function ReviewActionDialogs(props: Props) {
  if (!props.action) return null;
  if (props.action === "accept") return <AcceptDialog {...props} />;
  if (props.action === "override" || props.action === "resolve-classification" || props.action === "modify-decision" || props.action === "modify-resolution") return <CategoryDecisionDialog {...props} action={props.action} />;
  if (props.action === "request-info") return <RequestInfoDialog {...props} />;
  if (props.action === "escalate") return <EscalateDialog {...props} />;
  const resolution = props.action === "approve-resolution" || props.action === "reject-resolution";
  const approve = props.action === "approve-override" || props.action === "approve-resolution";
  return <ReasonDialog {...props} title={approve ? (resolution ? "Approve classification resolution" : "Approve override") : (resolution ? "Reject classification resolution" : "Reject override")} label={approve ? (resolution ? "Approve Classification" : "Approve Override") : (resolution ? "Reject Classification" : "Reject Override")} action={props.action} />;
}
