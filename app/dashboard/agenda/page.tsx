import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  dayKey,
  daysUntil,
  deadlineLabel,
  monthLabel,
  monthParam,
  parseMonthParam,
  shiftMonth,
} from "@/lib/agenda";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/projects/status-badge";
import { AgendaList } from "@/components/agenda/agenda-list";
import { MonthCalendar } from "@/components/agenda/month-calendar";
import type {
  AgendaByDay,
  AgendaProject,
} from "@/components/agenda/agenda-types";

export const metadata = { title: "Agenda — inDash" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const { year, month } = parseMonthParam(mes);

  // Margem de 1 dia nas bordas para cobrir a diferença entre UTC e o fuso local
  const rangeStart = new Date(year, month - 1, 1);
  rangeStart.setDate(rangeStart.getDate() - 1);
  const rangeEnd = new Date(year, month, 1);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const supabase = await createClient();
  const [{ data: projects }, { data: deadlineProjects }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, status, scheduled_at, clients(name)")
      .not("scheduled_at", "is", null)
      .neq("status", "cancelado")
      .gte("scheduled_at", rangeStart.toISOString())
      .lt("scheduled_at", rangeEnd.toISOString())
      .order("scheduled_at"),
    // Os prazos não seguem o mês navegado: são o que está por vir agora,
    // senão sumiriam justamente ao olhar o mês seguinte.
    supabase
      .from("projects")
      .select("id, title, status, deadline, clients(name)")
      .not("deadline", "is", null)
      .in("status", ["agendado", "em_andamento"])
      .order("deadline")
      .limit(8),
  ]);

  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const byDay: AgendaByDay = new Map();
  for (const project of (projects ?? []) as AgendaProject[]) {
    const key = dayKey(new Date(project.scheduled_at!));
    if (!key.startsWith(prefix)) continue;
    byDay.set(key, [...(byDay.get(key) ?? []), project]);
  }

  const deadlines = deadlineProjects ?? [];
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const isEmpty = byDay.size === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="mt-1 text-muted-foreground">
            Seus projetos agendados, mês a mês — e os prazos no fim da página.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/agenda?mes=${monthParam(prev.year, prev.month)}`}
            className={buttonVariants({ variant: "outline", size: "icon" })}
            aria-label="Mês anterior"
          >
            <ChevronLeft />
          </Link>
          <span className="min-w-36 text-center font-medium">
            {monthLabel(year, month)}
          </span>
          <Link
            href={`/dashboard/agenda?mes=${monthParam(next.year, next.month)}`}
            className={buttonVariants({ variant: "outline", size: "icon" })}
            aria-label="Próximo mês"
          >
            <ChevronRight />
          </Link>
          <Link
            href="/dashboard/agenda"
            className={buttonVariants({ variant: "outline" })}
          >
            Hoje
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <CalendarDays className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">Nada agendado em {monthLabel(year, month).toLowerCase()}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Projetos com data de agendamento aparecem aqui. Defina a data ao
              criar ou editar um projeto.
            </p>
          </div>
          <Link href="/dashboard/projetos" className={buttonVariants()}>
            Ir para projetos
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <MonthCalendar year={year} month={month} byDay={byDay} />
          </div>
          <div className="md:hidden">
            <AgendaList byDay={byDay} />
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-5" aria-hidden /> Prazos próximos
          </CardTitle>
          <CardDescription>
            Entregas dos projetos agendados e em andamento, independente do mês
            que você está vendo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadlines.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum projeto ativo com prazo definido. Defina o prazo ao criar
              ou editar um projeto.
            </p>
          ) : (
            <ul className="space-y-2">
              {deadlines.map((project) => {
                const restam = daysUntil(project.deadline!);
                const atrasado = restam < 0;
                // Uma semana é o ponto em que o prazo deixa de ser "depois"
                const apertado = !atrasado && restam <= 7;
                return (
                  <li key={project.id}>
                    <Link
                      href={`/dashboard/projetos/${project.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-ring/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{project.title}</p>
                        <p
                          className={cn(
                            "text-sm",
                            atrasado
                              ? "font-medium text-destructive"
                              : apertado
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                          )}
                        >
                          {new Date(project.deadline!).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          — {deadlineLabel(project.deadline!)}
                          {project.clients?.name &&
                            ` · ${project.clients.name}`}
                        </p>
                      </div>
                      <StatusBadge status={project.status} className="shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
