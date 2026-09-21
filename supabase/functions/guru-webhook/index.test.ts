// Run with: deno test --allow-env --allow-net supabase/functions/guru-webhook/index.test.ts
//
// Covers the fail-closed guard only (no GURU_WEBHOOK_SECRET configured, or
// wrong token) — this is what the guard exists to prevent from ever
// regressing back to the "if (webhookSecret) {...}" bug where an unset
// secret silently skipped auth entirely instead of refusing the request.
// The success path (real Supabase writes) needs a live/mocked DB and is
// out of scope here.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleRequest } from "./index.ts";

// createClient() is constructed before the secret check runs, so these need
// to be set even though no network call is actually made in the guard path.
Deno.env.set("SUPABASE_URL", "https://example.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");

function req(body: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request("https://example.supabase.co/functions/v1/guru-webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

Deno.test("refuses with 500 when GURU_WEBHOOK_SECRET is not configured", async () => {
  Deno.env.delete("GURU_WEBHOOK_SECRET");
  const res = await handleRequest(req());
  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Server configuration error");
});

Deno.test("refuses with 401 when token is missing", async () => {
  Deno.env.set("GURU_WEBHOOK_SECRET", "test-secret");
  try {
    const res = await handleRequest(req({ email: "attacker@example.com", status: "approved" }));
    assertEquals(res.status, 401);
  } finally {
    Deno.env.delete("GURU_WEBHOOK_SECRET");
  }
});

Deno.test("refuses with 401 when x-guru-token header is wrong", async () => {
  Deno.env.set("GURU_WEBHOOK_SECRET", "test-secret");
  try {
    const res = await handleRequest(
      req({ email: "attacker@example.com", status: "approved" }, { "x-guru-token": "wrong-value" })
    );
    assertEquals(res.status, 401);
  } finally {
    Deno.env.delete("GURU_WEBHOOK_SECRET");
  }
});

Deno.test("OPTIONS preflight is not gated by the secret", async () => {
  Deno.env.delete("GURU_WEBHOOK_SECRET");
  const res = await handleRequest(
    new Request("https://example.supabase.co/functions/v1/guru-webhook", { method: "OPTIONS" })
  );
  assertEquals(res.status, 200);
});
