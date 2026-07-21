"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/supabase/require-user";
import {
  preferencesSchema,
  profileNameSchema,
  type PreferencesValues,
  type ProfileNameValues,
} from "@/lib/validations/preferences";

const INVALID = "Dados inválidos. Confira os campos.";
const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

export async function updatePreferences(values: PreferencesValues) {
  const parsed = preferencesSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("preferences")
    .update({
      theme: parsed.data.theme,
      font_size: parsed.data.fontSize,
      font_family: parsed.data.fontFamily,
      high_contrast: parsed.data.highContrast,
      email_notifications: parsed.data.emailNotifications,
    })
    .eq("user_id", user.id);

  if (error) return { error: GENERIC };

  // Cookie usado pelo script anti-flash do layout raiz
  const cookieStore = await cookies();
  cookieStore.set(
    "indash-prefs",
    JSON.stringify({
      theme: parsed.data.theme,
      fontSize: parsed.data.fontSize,
      font: parsed.data.fontFamily,
      highContrast: parsed.data.highContrast,
    }),
    { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" }
  );

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function updateProfileName(values: ProfileNameValues) {
  const parsed = profileNameSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("user_id", user.id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
