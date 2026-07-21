import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  dayKey,
  monthLabel,
  monthParam,
  parseMonthParam,
  shiftMonth,
} from "@/lib/agenda";
import { buttonVariants } from "@/components/ui/button";
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
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, scheduled_at, clients(name)")
    .not("scheduled_at", "is", null)
    .neq("status", "cancelado")
    .gte("scheduled_at", rangeStart.toISOString())
    .lt("scheduled_at", rangeEnd.toISOString())
    .order("scheduled_at");

  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const byDay: AgendaByDay = new Map();
  for (const project of (projects ?? []) as AgendaProject[]) {
    const key = dayKey(new Date(project.scheduled_at!));
    if (!key.startsWith(prefix)) continue;
    byDay.set(key, [...(byDay.get(key) ?? []), project]);
  }

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const isEmpty = byDay.size === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="mt-1 text-muted-foreground">
            Seus projetos agendados, mês a mês.
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
    </div>
  );
}
