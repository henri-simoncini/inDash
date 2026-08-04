import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL, formatFactor } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/projects/status-badge";
import { ProjectActions } from "@/components/projects/project-actions";
import { TaskList } from "@/components/projects/task-list";
import { ProjectPayments } from "@/components/payments/project-payments";

export const metadata = { title: "Projeto — inDash" };

function formatDate(value: string | null, withTime = false) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}

export default async function ProjetoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: tasks }, { data: applied }, { data: payments }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*, clients(id, name), services(id, name)")
        .eq("id", id)
        .single(),
      supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .order("position")
        .order("created_at"),
      supabase
        .from("project_multipliers")
        .select("factor_snapshot, multipliers(name)")
        .eq("project_id", id),
      supabase
        .from("payments")
        .select("*")
        .eq("project_id", id)
        .order("created_at"),
    ]);

  if (!project) notFound();

  const [{ data: formClients }, { data: formServices }] = await Promise.all([
    supabase.from("clients").select("id, name").eq("archived", false).order("name"),
    supabase.from("services").select("id, name, base_price").order("name"),
  ]);

  const snapshotProduct = (applied ?? []).reduce(
    (total, m) => total * m.factor_snapshot,
    1
  );
  const readOnly =
    project.status === "finalizado" || project.status === "cancelado";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/projetos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar para projetos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.clients ? (
              <Link
                href={`/dashboard/clientes/${project.clients.id}`}
                className="underline-offset-4 hover:underline"
              >
                {project.clients.name}
              </Link>
            ) : (
              "Cliente removido"
            )}{" "}
            · {project.services?.name ?? "Serviço removido"}
          </p>
        </div>
        <ProjectActions
          project={project}
          clients={formClients ?? []}
          services={formServices ?? []}
          snapshotProduct={snapshotProduct}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>TO-DO list</CardTitle>
            <CardDescription>
              {readOnly
                ? "Projeto encerrado — reabra para editar as tarefas."
                : "Tudo que precisa ser feito até a entrega."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaskList projectId={project.id} tasks={tasks ?? []} readOnly={readOnly} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Preço base</span>
                <span className="tabular-nums">
                  {formatBRL(project.base_price)}
                </span>
              </div>
              {(applied ?? []).map((m, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-muted-foreground"
                >
                  <span>{m.multipliers?.name ?? "Fator excluído"}</span>
                  <span className="tabular-nums">
                    {formatFactor(m.factor_snapshot)}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-semibold">
                <span>Preço final</span>
                <span className="font-heading text-[1.35rem]">
                  {formatBRL(project.final_price)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Agendado para</span>
                <span>{formatDate(project.scheduled_at, true) ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Prazo</span>
                <span>{formatDate(project.deadline) ?? "—"}</span>
              </div>
              {project.completed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Concluído em</span>
                  <span>{formatDate(project.completed_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectPayments
                projectId={project.id}
                finalPrice={project.final_price}
                payments={payments ?? []}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
