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
import {
  emailSchema,
  setPasswordSchema,
  type EmailValues,
  type SetPasswordValues,
} from "@/lib/validations/password";

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

/**
 * Envia o link de redefinição de senha. Útil também para quem entrou pelo
 * Google e nunca teve senha — o link permite criar uma.
 */
export async function requestPasswordReset(values: EmailValues) {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const parsed = emailSchema.safeParse(values);
  if (!parsed.success) return { error: "Informe um email válido." };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/auth/callback?next=/redefinir-senha` }
  );

  if (error) {
    console.error("[inDash] Falha ao enviar recuperação:", error.code, error.message);
    return { error: authErrorMessage(error, "Não foi possível enviar o link.") };
  }

  // Resposta igual para email existente ou não: não revelamos quem tem conta
  return { success: true };
}

/** Define a senha do usuário logado — não depende de email. */
export async function setPassword(values: SetPasswordValues) {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const parsed = setPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("[inDash] Falha ao definir senha:", error.code, error.message);
    return { error: authErrorMessage(error, "Não foi possível salvar a senha.") };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
