"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/require-user";
import type { Enums } from "@/lib/database.types";
import {
  projectSchema,
  projectUpdateSchema,
  taskNotesSchema,
  taskSchema,
  type ProjectUpdateValues,
  type ProjectValues,
} from "@/lib/validations/project";

const INVALID = "Dados inválidos. Confira os campos.";
const EXPIRED = "Sessão expirada. Entre novamente.";
const GENERIC = "Algo deu errado. Tente novamente.";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function toTimestamp(value: string | undefined, endOfDay = false) {
  if (!value) return null;
  const date = endOfDay && !value.includes("T") ? `${value}T23:59:59` : value;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function revalidateProject(id?: string) {
  revalidatePath("/dashboard/projetos");
  if (id) revalidatePath(`/dashboard/projetos/${id}`);
}

export async function createProject(values: ProjectValues) {
  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  // Fatores lidos do banco (não do cliente) para gravar o snapshot com integridade
  let factors: { id: string; factor: number }[] = [];
  if (parsed.data.multiplierIds.length > 0) {
    const { data, error } = await supabase
      .from("multipliers")
      .select("id, factor")
      .in("id", parsed.data.multiplierIds);
    if (error || !data || data.length !== parsed.data.multiplierIds.length) {
      return { error: GENERIC };
    }
    factors = data;
  }

  const finalPrice = round2(
    factors.reduce((total, m) => total * m.factor, parsed.data.basePrice)
  );

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      client_id: parsed.data.clientId,
      service_id: parsed.data.serviceId,
      base_price: parsed.data.basePrice,
      final_price: finalPrice,
      scheduled_at: toTimestamp(parsed.data.scheduledAt),
      deadline: toTimestamp(parsed.data.deadline, true),
    })
    .select("id")
    .single();

  if (error || !project) return { error: GENERIC };

  if (factors.length > 0) {
    const { error: multipliersError } = await supabase
      .from("project_multipliers")
      .insert(
        factors.map((m) => ({
          user_id: user.id,
          project_id: project.id,
          multiplier_id: m.id,
          factor_snapshot: m.factor,
        }))
      );
    if (multipliersError) {
      // Desfaz o projeto para não deixar preço sem os fatores que o geraram
      await supabase.from("projects").delete().eq("id", project.id);
      return { error: GENERIC };
    }
  }

  revalidateProject(project.id);
  return { success: true, id: project.id };
}

export async function updateProject(id: string, values: ProjectUpdateValues) {
  const parsed = projectUpdateSchema.safeParse(values);
  if (!parsed.success) return { error: INVALID };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  // Recalcula o preço final com os snapshots já gravados
  const { data: snapshots } = await supabase
    .from("project_multipliers")
    .select("factor_snapshot")
    .eq("project_id", id);

  const finalPrice = round2(
    (snapshots ?? []).reduce(
      (total, m) => total * m.factor_snapshot,
      parsed.data.basePrice
    )
  );

  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      client_id: parsed.data.clientId,
      base_price: parsed.data.basePrice,
      final_price: finalPrice,
      scheduled_at: toTimestamp(parsed.data.scheduledAt),
      deadline: toTimestamp(parsed.data.deadline, true),
    })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject(id);
  return { success: true };
}

export async function updateProjectStatus(
  id: string,
  status: Enums<"project_status">
) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  if (status === "finalizado") {
    const { count } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id)
      .eq("done", false);

    if (count && count > 0) {
      return {
        error:
          count === 1
            ? "Ainda há 1 tarefa pendente. Conclua a TO-DO list para finalizar."
            : `Ainda há ${count} tarefas pendentes. Conclua a TO-DO list para finalizar.`,
      };
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({
      status,
      completed_at: status === "finalizado" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject(id);
  return { success: true };
}

export async function deleteProject(id: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject();
  return { success: true };
}

export async function addTask(projectId: string, title: string) {
  const parsed = taskSchema.safeParse({ title });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    project_id: projectId,
    title: parsed.data.title,
    position: count ?? 0,
  });

  if (error) return { error: GENERIC };
  revalidateProject(projectId);
  return { success: true };
}

export async function toggleTask(id: string, projectId: string, done: boolean) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("tasks").update({ done }).eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject(projectId);
  return { success: true };
}

export async function updateTaskNotes(
  id: string,
  projectId: string,
  notes: string
) {
  const parsed = taskNotesSchema.safeParse({ notes });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const value = parsed.data.notes.trim();
  const { error } = await supabase
    .from("tasks")
    // Texto vazio limpa a observação, em vez de gravar string em branco
    .update({ notes: value === "" ? null : value })
    .eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject(projectId);
  return { success: true };
}

export async function deleteTask(id: string, projectId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: EXPIRED };

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return { error: GENERIC };
  revalidateProject(projectId);
  return { success: true };
}
