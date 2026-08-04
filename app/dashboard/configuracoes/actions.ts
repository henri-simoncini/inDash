"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/supabase/require-user";
import type { TablesUpdate } from "@/lib/database.types";
import {
  preferencesSchema,
  profileNameSchema,
  type PreferencesValues,
  type ProfileNameValues,
} from "@/lib/validations/preferences";
import {
  pixSettingsSchema,
  type PixSettingsValues,
} from "@/lib/validations/pix";

/**
 * As colunas de Pix são novas: os tipos gerados do Supabase só passam a
 * conhecê-las depois que a migration for aplicada e os tipos regerados.
 * Até lá este cast mantém o restante do arquivo tipado normalmente.
 */
function pixColumns(values: {
  pix_key: string | null;
  pix_key_type: string | null;
  pix_name: string | null;
  pix_city: string | null;
}) {
  return values as unknown as TablesUpdate<"profiles">;
}

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

export async function updatePixSettings(values: PixSettingsValues) {
  const parsed = pixSettingsSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("profiles")
    .update(
      pixColumns({
        pix_key: parsed.data.key.trim(),
        pix_key_type: parsed.data.keyType,
        pix_name: parsed.data.name.trim(),
        pix_city: parsed.data.city.trim(),
      })
    )
    .eq("user_id", user.id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function removePixSettings() {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("profiles")
    .update(
      pixColumns({
        pix_key: null,
        pix_key_type: null,
        pix_name: null,
        pix_city: null,
      })
    )
    .eq("user_id", user.id);

  if (error) return { error: GENERIC };
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
