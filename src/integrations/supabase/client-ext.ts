// Re-exports the Supabase client cast against our extended Database type
// (which adds custom views like `team_members_public`). Use this anywhere
// you need to query a view that isn't in the auto-generated types.
//
// The underlying client instance is the same — we only widen the types.

import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./client";
import type { Database } from "./extended-types";

export const supabaseExt = supabase as unknown as SupabaseClient<Database>;
