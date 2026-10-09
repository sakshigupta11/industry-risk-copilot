"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { getReview, getReviews } from "@/lib/api/reviews";
import { toQueueReview, toReviewFixture } from "@/lib/api/mappers";
import type { ReviewQuery } from "@/lib/api/types";
import type { ReviewDetail } from "@/lib/api/types";
import type { ReviewFixture } from "@/lib/review-types";

type LoadState = { loading: boolean; error?: string; warnings: string[] };
type ReviewContextValue = {
  reviews: ReviewFixture[];
  activeReview?: ReviewFixture;
  queueState: LoadState;
  reviewState: LoadState;
  loadQueue: (query?: ReviewQuery) => Promise<void>;
  loadReview: (reviewId: string) => Promise<void>;
  replaceReview: (review: ReviewDetail) => void;
  clearReview: () => void;
};
const initialState: LoadState = { loading: false, warnings: [] };
const ReviewContext = createContext<ReviewContextValue | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ReviewFixture[]>([]);
  const [activeReview, setActiveReview] = useState<ReviewFixture>();
  const [queueState, setQueueState] = useState<LoadState>(initialState);
  const [reviewState, setReviewState] = useState<LoadState>(initialState);
  const loadQueue = useCallback(async (query: ReviewQuery = {}) => { setQueueState({ loading: true, warnings: [] }); try { const { data, warnings } = await getReviews(query); setReviews(data.reviews.map(toQueueReview)); setQueueState({ loading: false, warnings }); } catch (error) { setReviews([]); setQueueState({ loading: false, warnings: [], error: error instanceof Error ? error.message : "Unable to load reviews." }); } }, []);
  const loadReview = useCallback(async (reviewId: string) => { setReviewState({ loading: true, warnings: [] }); try { const { review, warnings } = await getReview(reviewId); setActiveReview(toReviewFixture(review)); setReviewState({ loading: false, warnings }); } catch (error) { setActiveReview(undefined); setReviewState({ loading: false, warnings: [], error: error instanceof Error ? error.message : "Unable to load review." }); } }, []);
  const clearReview = useCallback(() => { setActiveReview(undefined); setReviewState(initialState); }, []);
  const replaceReview = useCallback((review: ReviewDetail) => { const mapped = toReviewFixture(review); setActiveReview(mapped); setReviews((items) => items.map((item) => item.id === mapped.id ? mapped : item)); }, []);
  return <ReviewContext.Provider value={{ reviews, activeReview, queueState, reviewState, loadQueue, loadReview, replaceReview, clearReview }}>{children}</ReviewContext.Provider>;
}
export function useReviews() { const context = useContext(ReviewContext); if (!context) throw new Error("useReviews must be used within a ReviewProvider."); return context; }
