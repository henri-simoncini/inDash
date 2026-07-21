"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/require-user";
import {
  multiplierSchema,
  serviceSchema,
  type MultiplierValues,
  type ServiceValues,
} from "@/lib/validations/service";

const INVALID = "Dados inválidos. Confira os campos.";
const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

export async function createService(values: ServiceValues) {
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("services").insert({
    user_id: user.id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    base_price: parsed.data.basePrice,
    active: parsed.data.active,
  });

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function updateService(id: string, values: ServiceValues) {
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      base_price: parsed.data.basePrice,
      active: parsed.data.active,
    })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function deleteService(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    // 23503 = violação de FK: existe projeto usando este serviço
    if (error.code === "23503") {
      return {
        error:
          "Este serviço tem projetos vinculados e não pode ser excluído. Você pode desativá-lo.",
      };
    }
    return { error: GENERIC };
  }

  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function createMultiplier(values: MultiplierValues) {
  const parsed = multiplierSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("multipliers").insert({
    user_id: user.id,
    name: parsed.data.name,
    kind: parsed.data.kind,
    factor: parsed.data.factor,
    service_id: parsed.data.serviceId === "global" ? null : parsed.data.serviceId,
  });

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function updateMultiplier(id: string, values: MultiplierValues) {
  const parsed = multiplierSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("multipliers")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      factor: parsed.data.factor,
      service_id:
        parsed.data.serviceId === "global" ? null : parsed.data.serviceId,
    })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/servicos");
  return { success: true };
}

export async function deleteMultiplier(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("multipliers").delete().eq("id", id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/servicos");
  return { success: true };
}
