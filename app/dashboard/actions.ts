"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/require-user";

const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

async function updateProfile(values: {
  tour_seen?: { completed: boolean; completed_at?: string };
  onboarding_completed?: boolean;
}) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("profiles")
    .update(values)
    .eq("user_id", user.id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function completeTour() {
  return updateProfile({
    tour_seen: { completed: true, completed_at: new Date().toISOString() },
  });
}

// Usado pelas Configurações (Fase 9) para reabrir o tour
export async function reopenTour() {
  return updateProfile({ tour_seen: { completed: false } });
}

export async function dismissOnboarding() {
  return updateProfile({ onboarding_completed: true });
}

// Usado pelas Configurações (Fase 9) para reexibir o checklist
export async function reopenOnboarding() {
  return updateProfile({ onboarding_completed: false });
}
