"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/providers/role-context";
import { createReview } from "@/lib/api/reviews";
import { getDemoIdentity } from "@/lib/demo-identity";
import { SelectedFile } from "./selected-file";
import { UploadDropzone } from "./upload-dropzone";

export function AnalyzeCompany() {
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string>(); const [recoveryRequired, setRecoveryRequired] = useState(false);
  const { role } = useRole(); const router = useRouter();
  const clearFile = () => setFile(null);

  const submit = async () => {
    if (!file || submitting || recoveryRequired) return;
    setSubmitting(true); setError(undefined); setRecoveryRequired(false);
    try {
      const identity = getDemoIdentity(role);
      const { review } = await createReview({ file, website: website || undefined, submitted_by_name: identity.name, submitted_by_email: identity.email, submitted_by_role: identity.role });
      setFile(null); setWebsite(""); router.push(`/reviews/${review.case_id}`);
    } catch (reason) {
      // The backend may have completed after a gateway timeout. Keep this exact file from
      // being submitted again and recover from the authoritative queue instead.
      setRecoveryRequired(true);
      setError(reason instanceof Error ? `${reason.message} The submission may still have completed; open the queue before submitting again.` : "The response was interrupted. Open the queue before submitting again.");
    } finally { setSubmitting(false); }
  };
  return <div className="mx-auto max-w-5xl">
    <div className="border-b border-border pb-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Company Review</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Analyze company</h2><p className="mt-2 text-sm leading-6 text-muted">Upload a company document to generate an industry classification and FinCrime review.</p></div>
    <section className="mx-auto mt-7 max-w-3xl rounded-[10px] border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(16_42_86_/_0.04),0_8px_24px_rgb(16_42_86_/_0.05)] sm:p-7"><div><h3 className="text-lg font-semibold tracking-tight text-foreground">Upload company PDF</h3><p className="mt-1.5 text-sm leading-6 text-muted">The review service will prepare a company review using the submitted document.</p></div><div className="mt-6">{file ? <SelectedFile file={file} onRemove={clearFile} /> : <UploadDropzone onFileSelected={setFile} />}</div><div className="mt-5"><label htmlFor="website" className="block text-sm font-semibold text-foreground">Company website <span className="font-normal text-muted">(optional)</span></label><input id="website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://example.com" className="mt-2 h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-[#99a2b1] focus:border-accent focus:outline-none" /></div>{error && <div className="mt-4 rounded-lg border border-[#f2c7c4] bg-[#fff8f7] p-3 text-sm text-[#a1322b]"><p>{error}</p>{recoveryRequired && <p className="mt-2 text-xs">The same document remains locked to prevent an accidental duplicate. Open the queue to check whether the review was created.</p>}</div>}<div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-muted">{submitting ? "Analyzing the document. This usually takes around 30 seconds." : "PDF submissions are sent to the review service."}</p><button type="button" disabled={!file || submitting || recoveryRequired} onClick={() => void submit()} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#aab5c7]">{submitting && <span className="size-3 animate-spin rounded-full border-2 border-white/35 border-t-white" />}{submitting ? "Analyzing document…" : "Analyze company"}</button></div></section>
    <div className="mt-6 text-center"><Link href="/reviews" className="text-sm font-semibold text-accent hover:text-navy">View review queue →</Link></div>
  </div>;
}
