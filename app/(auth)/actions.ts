"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { authErrorMessage } from "@/lib/auth-errors";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validations/auth";

const NOT_CONFIGURED =
  "Este ambiente está sem as credenciais do Supabase, então o login não " +
  "funciona por aqui. Avise o responsável pelo site.";

export async function signIn(values: SignInValues) {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("[inDash] Falha no login:", error.code, error.message);
    return { error: authErrorMessage(error, "Não foi possível entrar.") };
  }

  redirect("/dashboard");
}

export async function signUp(values: SignUpValues) {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos." };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("[inDash] Falha no cadastro:", error.code, error.message);
    return {
      error: authErrorMessage(error, "Não foi possível criar a conta."),
    };
  }

  return { success: true };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    return { error: "Não foi possível iniciar o login com Google." };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
