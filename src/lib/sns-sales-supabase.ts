import { createClient } from "@supabase/supabase-js";

// Publishable client credentials. These are intentionally public.
// Security is enforced by Auth, RLS, Storage policies, and server-side functions.
const supabaseUrl = "https://pexoeftnkbcowauxhopf.supabase.co";
const supabasePublishableKey = "sb_publishable_l_wSycnldZk5Q_-9PZQegA_Gvx8ibSh";

export const snsSalesSupabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
