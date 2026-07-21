import type { Enums } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ProjectStatus = Enums<"project_status">;

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  agendado: "Agendado",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  agendado:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  em_andamento:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  finalizado:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelado: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(STATUS_CLASSES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
