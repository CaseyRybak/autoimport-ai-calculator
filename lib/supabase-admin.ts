import "server-only";

import { createClient } from "@supabase/supabase-js";

export type SupabaseAdminClientDebug = {
  adminClientUsesServiceRoleEnv: boolean;
  adminClientKeyPrefix: string | null;
};

function getSupabaseAdminEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isSupabaseAdminConfigured() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminEnv();

  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getSupabaseAdminClientDebug(): SupabaseAdminClientDebug {
  const { supabaseServiceRoleKey } = getSupabaseAdminEnv();

  return {
    adminClientUsesServiceRoleEnv: Boolean(supabaseServiceRoleKey),
    adminClientKeyPrefix: supabaseServiceRoleKey ? supabaseServiceRoleKey.slice(0, 3) : null,
  };
}

export function createSupabaseAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseAdminEnv();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
