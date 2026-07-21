import { createClient } from "@/lib/supabase/server";

// Client Supabase + usuário logado, para uso em Server Actions.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
