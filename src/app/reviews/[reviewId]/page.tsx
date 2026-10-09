import { ReviewWorkspace } from "@/components/review/review-workspace";

export const instant = false;

type ReviewPageProps = { params: Promise<{ reviewId: string }> };

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { reviewId } = await params;
  return <ReviewWorkspace reviewId={reviewId} />;
}
