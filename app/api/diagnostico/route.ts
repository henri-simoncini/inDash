import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/config";

// TEMPORÁRIO: captura o erro real que derruba as rotas do dashboard em
// produção. Não devolve chaves — só host e mensagem de erro. Remover depois.
export async function GET() {
  const steps: Record<string, unknown> = {
    configured: isSupabaseConfigured,
    host: supabaseUrl ? new URL(supabaseUrl).host : null,
    runtime: process.env.NEXT_RUNTIME ?? "node",
  };

  try {
    const supabase = await createClient();
    steps.clientCreated = true;

    const { data, error } = await supabase.auth.getUser();
    steps.getUserReturned = true;
    steps.hasUser = Boolean(data?.user);
    steps.authError = error ? `${error.name}: ${error.message}` : null;
  } catch (error) {
    const e = error as Error;
    steps.threw = true;
    steps.errorName = e?.name ?? null;
    steps.errorMessage = e?.message ?? String(error);
    steps.errorStackTop = e?.stack?.split("\n").slice(0, 4).join(" | ") ?? null;
  }

  return NextResponse.json(steps);
}
