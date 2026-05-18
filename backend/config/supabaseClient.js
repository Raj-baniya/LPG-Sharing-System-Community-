const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Warning: SUPABASE_URL and SUPABASE_ANON_KEY are missing from environment variables!");
}

const supabasePublic = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Use service role if available, otherwise fallback to anon key
const supabaseAdmin = createClient(
  supabaseUrl || "",
  supabaseServiceRoleKey || supabaseAnonKey || "",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);

const getSupabasePublicClient = () => supabasePublic;
const getSupabaseAdminClient = () => supabaseAdmin;
const getSupabaseClient = getSupabasePublicClient;
const getSupabaseAdmin = getSupabaseAdminClient;

const hasSupabaseConfig = () => !!(supabaseUrl && supabaseAnonKey);
const hasServiceRole = () => !!supabaseServiceRoleKey;

module.exports = {
  getSupabasePublicClient,
  getSupabaseAdminClient,
  getSupabaseClient,
  getSupabaseAdmin,
  hasSupabaseConfig,
  hasServiceRole,
};
