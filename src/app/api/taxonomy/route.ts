import { proxyRead } from "@/lib/api/read-proxy";
export async function GET(request: Request) { return proxyRead("/fincrime-v2/taxonomy", request); }
