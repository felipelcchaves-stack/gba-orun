

# Fix: Edge Function "admin-manage-users" Auth Error

## Problem

The edge function uses `anonClient.auth.getClaims(token)` which does not exist in `@supabase/supabase-js@2`. This causes every call to fail with a non-2xx status code.

## Solution

Replace `getClaims` with `anonClient.auth.getUser(token)` which is the correct v2 method to validate a JWT and extract the user ID.

## Changes

### `supabase/functions/admin-manage-users/index.ts`

Replace lines 34-42:
```typescript
const { data: { user: caller }, error: callerError } = await anonClient.auth.getUser(token);
if (callerError || !caller) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
const callerId = caller.id;
```

This uses the standard `getUser()` method to validate the token and extract the caller's user ID, then proceeds with the existing `has_role` check.

