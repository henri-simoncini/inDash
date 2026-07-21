"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/require-user";
import { paymentSchema, type PaymentValues } from "@/lib/validations/payment";

const INVALID = "Dados inválidos. Confira os campos.";
const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

function revalidateFinance(projectId?: string) {
  revalidatePath("/dashboard/financeiro");
  revalidatePath("/dashboard/projetos");
  if (projectId) revalidatePath(`/dashboard/projetos/${projectId}`);
}

// Meio-dia local evita que a data mude de dia na conversão de fuso
function paidAtTimestamp(paidAt: string | undefined) {
  if (paidAt) {
    const parsed = new Date(`${paidAt}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

export async function createPayment(projectId: string, values: PaymentValues) {
  const parsed = paymentSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("payments").insert({
    user_id: user.id,
    project_id: projectId,
    amount: parsed.data.amount,
    status: parsed.data.status,
    paid_at:
      parsed.data.status === "pago"
        ? paidAtTimestamp(parsed.data.paidAt)
        : null,
    method: parsed.data.method || null,
  });

  if (error) return { error: GENERIC };
  revalidateFinance(projectId);
  return { success: true };
}

export async function markPaymentPaid(id: string, projectId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase
    .from("payments")
    .update({ status: "pago", paid_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidateFinance(projectId);
  return { success: true };
}

export async function deletePayment(id: string, projectId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) return { error: GENERIC };
  revalidateFinance(projectId);
  return { success: true };
}
