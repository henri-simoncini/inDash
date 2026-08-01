import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import {
  isSupabaseConfigured,
  MISSING_CONFIG_MESSAGE,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export async function createClient() {
  // cookies() antes de qualquer checagem: é o que marca a rota como dinâmica.
  // Lançar antes disso faria o Next tentar pré-renderizar e quebrar o build.
  const cookieStore = await cookies();

  if (!isSupabaseConfigured) {
    throw new Error(MISSING_CONFIG_MESSAGE);
  }

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado a partir de um Server Component: os cookies são
          // atualizados pelo proxy, então o erro pode ser ignorado.
        }
      },
    },
  });
}
