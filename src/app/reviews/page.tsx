import { Suspense } from "react";
import { ReviewQueue } from "@/components/queue/review-queue";

export default function ReviewsPage() {
  return <Suspense fallback={<div className="min-h-96 animate-pulse rounded-[10px] border border-border bg-surface" />}><ReviewQueue /></Suspense>;
}
