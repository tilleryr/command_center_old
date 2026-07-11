// Server-side Supabase client.
// Uses the SECRET key, which bypasses Row Level Security.
// NEVER import this from a client component (a file with "use client" at the top).
// For single-user dashboard: Server Components fetch data, render HTML, send to browser.
// The secret key never leaves the server.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
}
if (!secretKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY in .env.local");
}

export const supabase = createClient(url, secretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
