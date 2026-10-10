import { proxyIntake } from "@/lib/api/intake-proxy";
import { proxyRead } from "@/lib/api/read-proxy";
export async function GET(request: Request) { return proxyRead("/fincrime-v2/reviews", request); }
export async function POST(request: Request) { return proxyIntake(request); }
