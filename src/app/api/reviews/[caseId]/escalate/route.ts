import { proxyMutation } from "@/lib/api/mutation-proxy";
export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) { return proxyMutation((await params).caseId, "MANUAL_ESCALATION", request); }
