import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import {
  isSupabaseConfigured,
  MISSING_CONFIG_MESSAGE,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(MISSING_CONFIG_MESSAGE);
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
