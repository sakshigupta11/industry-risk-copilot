import { NextResponse } from "next/server";

const unavailable = () => NextResponse.json(
  { success: false, error: { code: "BACKEND_UNAVAILABLE", message: "The review service is temporarily unavailable.", retryable: true } },
  { status: 502 },
);

const invalidRequest = (message: string) => NextResponse.json(
  { success: false, error: { code: "INVALID_REQUEST", message, retryable: false } },
  { status: 400 },
);

export async function proxyIntake(request: Request) {
  const base = process.env.N8N_FINCRIME_INTAKE_BASE_URL
    ?? process.env.N8N_FINCRIME_WRITE_BASE_URL
    ?? process.env.N8N_FINCRIME_READ_BASE_URL;
  if (!base) return unavailable();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return invalidRequest("The uploaded document could not be read.");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return invalidRequest("Please select a PDF document to analyze.");

  for (const field of ["submitted_by_name", "submitted_by_email", "submitted_by_role"]) {
    if (typeof formData.get(field) !== "string" || !String(formData.get(field)).trim()) {
      return invalidRequest("Submitter details are required to create a review.");
    }
  }

  const target = new URL(`${base.replace(/\/$/, "")}/fincrime-copilot-v2`);
  try {
    // Do not set Content-Type: fetch adds the multipart boundary for this FormData body.
    const response = await fetch(target, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json" },
      body: formData,
      signal: AbortSignal.timeout(60_000),
    });
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      console.error("Review intake returned a non-JSON response", { status: response.status });
      return unavailable();
    }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error("Review intake proxy failed", { error });
    return unavailable();
  }
}
