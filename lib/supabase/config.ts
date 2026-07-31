// As variáveis NEXT_PUBLIC_ são embutidas no bundle durante o build, então
// precisam ser referenciadas literalmente para o Next conseguir substituí-las.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Falso quando o deploy subiu sem as variáveis do Supabase. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const MISSING_CONFIG_MESSAGE =
  "[inDash] Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente e refaça o build (as variáveis " +
  "NEXT_PUBLIC_ são embutidas no momento do build).";
