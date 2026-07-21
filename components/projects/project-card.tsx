import Link from "next/link";
import { CalendarClock, CircleCheckBig } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/projects/status-badge";
import type { ProjectListItem } from "@/components/projects/types";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const total = project.tasks.length;
  const done = project.tasks.filter((t) => t.done).length;
  const overdue =
    project.deadline &&
    project.status !== "finalizado" &&
    project.status !== "cancelado" &&
    new Date(project.deadline) < new Date();

  return (
    <Link
      href={`/dashboard/projetos/${project.id}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full gap-3 py-4 transition-colors hover:border-ring/60">
        <CardContent className="space-y-2 px-4">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{project.title}</p>
            <StatusBadge status={project.status} className="shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground">
            {project.clients?.name ?? "Cliente removido"} ·{" "}
            {project.services?.name ?? "Serviço removido"}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold tabular-nums">
              {formatBRL(project.final_price)}
            </span>
            {total > 0 && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CircleCheckBig className="size-3.5" aria-hidden />
                {done}/{total}
              </span>
            )}
            {project.deadline && (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  overdue ? "font-medium text-destructive" : "text-muted-foreground"
                )}
              >
                <CalendarClock className="size-3.5" aria-hidden />
                {new Date(project.deadline).toLocaleDateString("pt-BR")}
                {overdue && " — atrasado"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
