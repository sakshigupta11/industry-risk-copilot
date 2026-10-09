import { proxyRead } from "@/lib/api/read-proxy";
export async function GET(request: Request, { params }: { params: Promise<{ caseId: string }> }) { const { caseId } = await params; const url = new URL(request.url); url.searchParams.set("case_id", caseId); return proxyRead(`/fincrime-v2/review?${url.searchParams.toString()}`, new Request(url)); }
