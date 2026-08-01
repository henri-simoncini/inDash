// As variáveis NEXT_PUBLIC_ são embutidas no bundle durante o build, então
// precisam ser referenciadas literalmente para o Next conseguir substituí-las.

/** Tira espaços e aspas que costumam vir junto ao colar o valor no painel. */
function clean(value: string | undefined) {
  const trimmed = value?.trim().replace(/^['"]|['"]$/g, "");
  return trimmed ? trimmed : undefined;
}

/** Aceita o host sem protocolo (ex.: "abc.supabase.co") e completa com https. */
function normalizeUrl(value: string | undefined) {
  const cleaned = clean(value);
  if (!cleaned) return undefined;
  const withProtocol = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : `https://${cleaned}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return undefined;
  }
}

export const supabaseUrl = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Falso quando o deploy subiu sem as variáveis do Supabase — ou com uma URL
 * que não dá para consertar. Validar de verdade (e não só checar se está
 * preenchida) evita seguir com um valor quebrado e quebrar em produção.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const MISSING_CONFIG_MESSAGE =
  "[inDash] Supabase não configurado: NEXT_PUBLIC_SUPABASE_URL precisa ser " +
  "uma URL válida (ex.: https://seu-projeto.supabase.co) e " +
  "NEXT_PUBLIC_SUPABASE_ANON_KEY não pode estar vazia. Lembre que essas " +
  "variáveis são embutidas no build — depois de corrigir, refaça o deploy.";
