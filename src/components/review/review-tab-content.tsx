import type { ReviewFixture } from "@/lib/review-types";

export type ReviewTab = "Overview" | "Business Activities" | "Evidence" | "Issues & Conflicts" | "History";
type Props = { review: ReviewFixture; tab: ReviewTab; latestEvent?: { title: string; detail: string } };

function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="rounded-lg border border-dashed border-border bg-[#fbfcfd] px-4 py-5"><p className="text-sm font-semibold text-foreground">{title}</p><p className="mt-1 text-sm leading-6 text-muted">{detail}</p></div>; }

function History({ review, latestEvent }: Pick<Props, "review" | "latestEvent">) {
  const events = [...review.history, ...(latestEvent ? [{ id: "latest", time: "Now", ...latestEvent }] : [])];
  if (events.length === 0) return <EmptyState title="No history available" detail="The backend review timeline will appear here once the review service is connected." />;
  return <ol className="space-y-0">{events.map((event, index) => <li key={event.id} className="flex gap-4"><div className="flex w-12 shrink-0 flex-col items-end"><time className="pt-0.5 text-xs font-medium text-muted">{event.time}</time></div><div className="flex flex-col items-center"><span className="mt-1.5 size-2.5 rounded-full bg-accent" />{index < events.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}</div><div className="pb-5"><p className="text-sm font-semibold text-foreground">{event.title}</p><p className="mt-1 text-sm text-muted">{event.detail}</p></div></li>)}</ol>;
}

export function ReviewTabContent({ review, tab, latestEvent }: Props) {
  if (tab === "History") return <History review={review} latestEvent={latestEvent} />;
  const sections = tab === "Overview" ? [["Company summary", review.companySummary], ["Recommendation rationale", review.confidenceReason], ["Tie resolution", review.tieResolutionReason]] : tab === "Business Activities" ? [["Current activity", review.currentBusinessActivity], ["Future or planned activity", review.futureOrPlannedActivity], ["Material candidates", review.materialCandidates], ["Materiality unclear", review.materialityUnclearCandidates], ["Supporting or incidental", review.supportingCandidates]] : tab === "Evidence" ? [["Document evidence", review.evidence]] : [["Missing information", review.missingInformation], ["Conflicting information", review.conflictingInformation], ["Classification-critical gap", review.classificationCriticalGap === null || review.classificationCriticalGap === undefined ? undefined : review.classificationCriticalGap ? `Yes. ${review.classificationCriticalGapReason ?? ""}` : "No"]];
  const available = sections.filter(([, value]) => value);
  if (available.length) return <div className="space-y-5">{available.map(([label, value]) => <section key={label}><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</p>{tab === "Business Activities" ? <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-foreground">{String(value).split(" | ").map((item) => <li key={item}>{item.replace(/^[-—\s]+/, "")}</li>)}</ul> : <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{value}</p>}</section>)}</div>;
  const copy: Record<Exclude<ReviewTab, "History">, { title: string; detail: string }> = {
    Overview: { title: "Review analysis unavailable", detail: "Company summary, recommendation rationale, and review context will load from the review-detail API." },
    "Business Activities": { title: "No activities returned", detail: "Material, unclear, and supporting activities will be supplied by the backend analysis payload." },
    Evidence: { title: "No evidence returned", detail: "Document evidence and source references will be supplied by the backend analysis payload." },
    "Issues & Conflicts": { title: "No issues or conflicts returned", detail: "Classification-critical gaps and conflict resolution will be supplied by the backend analysis payload." },
  };
  return <EmptyState {...copy[tab]} />;
}
