// Run with: deno test --allow-env supabase/functions/check-expired-subscriptions/index.test.ts
//
// Covers the fail-closed guard only (no CRON_SECRET configured, or wrong
// x-cron-secret header) — this is what the guard exists to prevent from
// ever regressing back to the "silently skip the check" bug it fixed.
// The success path (real Supabase query) needs a live/mocked DB and is out
// of scope here.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleRequest } from "./index.ts";

function req(headers: Record<string, string> = {}) {
  return new Request("https://example.supabase.co/functions/v1/check-expired-subscriptions", {
    method: "POST",
    headers,
  });
}

Deno.test("refuses with 500 when CRON_SECRET is not configured", async () => {
  Deno.env.delete("CRON_SECRET");
  const res = await handleRequest(req());
  assertEquals(res.status, 500);
  const body = await res.json();
  assertEquals(body.error, "Server configuration error");
});

Deno.test("refuses with 401 when x-cron-secret header is missing", async () => {
  Deno.env.set("CRON_SECRET", "test-secret");
  try {
    const res = await handleRequest(req());
    assertEquals(res.status, 401);
  } finally {
    Deno.env.delete("CRON_SECRET");
  }
});

Deno.test("refuses with 401 when x-cron-secret header is wrong", async () => {
  Deno.env.set("CRON_SECRET", "test-secret");
  try {
    const res = await handleRequest(req({ "x-cron-secret": "wrong-value" }));
    assertEquals(res.status, 401);
  } finally {
    Deno.env.delete("CRON_SECRET");
  }
});

Deno.test("OPTIONS preflight is not gated by the secret", async () => {
  Deno.env.delete("CRON_SECRET");
  const res = await handleRequest(
    new Request("https://example.supabase.co/functions/v1/check-expired-subscriptions", {
      method: "OPTIONS",
    })
  );
  assertEquals(res.status, 200);
});
