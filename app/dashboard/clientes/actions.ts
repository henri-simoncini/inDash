"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/require-user";
import { clientSchema, type ClientValues } from "@/lib/validations/client";

const INVALID = "Dados inválidos. Confira os campos.";
const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

function toRow(values: ClientValues) {
  return {
    name: values.name,
    email: values.email || null,
    phone: values.phone || null,
    notes: values.notes || null,
  };
}

export async function createClientAction(values: ClientValues) {
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("clients")
    .insert({ user_id: user.id, ...toRow(parsed.data) });

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/clientes");
  return { success: true };
}

export async function updateClientAction(id: string, values: ClientValues) {
  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("clients")
    .update(toRow(parsed.data))
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

export async function setClientArchived(id: string, archived: boolean) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("clients")
    .update({ archived })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidatePath("/dashboard/clientes");
  revalidatePath(`/dashboard/clientes/${id}`);
  return { success: true };
}

export async function deleteClientAction(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    // 23503 = violação de FK: existe projeto vinculado a este cliente
    if (error.code === "23503") {
      return {
        error:
          "Este cliente tem projetos e não pode ser excluído. Arquive-o para tirá-lo da lista.",
        suggestArchive: true,
      };
    }
    return { error: GENERIC };
  }

  revalidatePath("/dashboard/clientes");
  return { success: true };
}
