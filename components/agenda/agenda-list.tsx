import Link from "next/link";
import { formatTime } from "@/lib/agenda";
import { StatusBadge } from "@/components/projects/status-badge";
import type { AgendaByDay } from "@/components/agenda/agenda-types";

function dayLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const label = new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function AgendaList({ byDay }: { byDay: AgendaByDay }) {
  const days = [...byDay.keys()].sort();

  return (
    <div className="space-y-5">
      {days.map((key) => (
        <section key={key} className="space-y-2">
          <h2 className="text-sm font-semibold">{dayLabel(key)}</h2>
          <ul className="space-y-2">
            {byDay.get(key)!.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projetos/${project.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-ring/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(new Date(project.scheduled_at!))}
                      {project.clients?.name && ` · ${project.clients.name}`}
                    </p>
                  </div>
                  <StatusBadge status={project.status} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
