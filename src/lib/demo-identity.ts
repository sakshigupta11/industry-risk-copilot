import type { ReviewerRole } from "@/lib/api/types";

export type DemoIdentity = { name: string; email: string; role: ReviewerRole };
export function getDemoIdentity(role: ReviewerRole): DemoIdentity { return { name: "Aisha Patel", email: "aisha.patel@example.com", role }; }
