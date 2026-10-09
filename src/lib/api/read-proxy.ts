import { NextResponse } from "next/server";

const unavailable = () => NextResponse.json({ success: false, error: { code: "BACKEND_UNAVAILABLE", message: "The review service is temporarily unavailable.", retryable: true } }, { status: 502 });

export async function proxyRead(path: string, request: Request) {
  const base = process.env.N8N_FINCRIME_READ_BASE_URL;
  if (!base) return unavailable();
  const incoming = new URL(request.url);
  const target = new URL(`${base.replace(/\/$/, "")}${path}`);
  incoming.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  try {
    const response = await fetch(target, { cache: "no-store", headers: { Accept: "application/json" } });
    const text = await response.text();
    let payload: unknown;
    try { payload = text ? JSON.parse(text) : {}; } catch { return unavailable(); }
    return NextResponse.json(payload, { status: response.status });
  } catch { return unavailable(); }
}
