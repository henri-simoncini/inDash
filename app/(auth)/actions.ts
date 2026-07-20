"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/lib/validations/auth";

export async function signIn(values: SignInValues) {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dados inválidos. Confira os campos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function signUp(values: SignUpValues) {
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
    if (error.code === "user_already_exists") {
      return { error: "Já existe uma conta com esse email." };
    }
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  return { success: true };
}

export async function signInWithGoogle() {
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
