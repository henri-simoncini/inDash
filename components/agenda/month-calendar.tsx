import Link from "next/link";
import { cn } from "@/lib/utils";
import { dayKey, formatTime } from "@/lib/agenda";
import type { AgendaByDay, AgendaProject } from "@/components/agenda/agenda-types";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CHIP_CLASSES: Record<AgendaProject["status"], string> = {
  agendado:
    "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900",
  em_andamento:
    "bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900",
  finalizado:
    "bg-muted text-muted-foreground opacity-70 hover:opacity-100",
  cancelado: "bg-muted text-muted-foreground",
};

export function MonthCalendar({
  year,
  month,
  byDay,
}: {
  year: number;
  month: number;
  byDay: AgendaByDay;
}) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = dayKey(new Date());

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-24 border-b border-r bg-muted/20 [&:nth-child(7n)]:border-r-0"
              />
            );
          }
          const key = `${year}-${String(month).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const isToday = key === todayKey;
          const projects = byDay.get(key) ?? [];

          return (
            <div
              key={key}
              className="min-h-24 space-y-1 border-b border-r p-1.5 [&:nth-child(7n)]:border-r-0"
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {day}
              </span>
              <div className="space-y-1">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projetos/${project.id}`}
                    className={cn(
                      "block truncate rounded px-1.5 py-0.5 text-xs transition-colors",
                      CHIP_CLASSES[project.status]
                    )}
                    title={`${project.title} — ${project.clients?.name ?? ""}`}
                  >
                    <span className="font-medium tabular-nums">
                      {formatTime(new Date(project.scheduled_at!))}
                    </span>{" "}
                    {project.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
