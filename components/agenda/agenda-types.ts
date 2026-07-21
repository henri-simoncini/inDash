import type { Tables } from "@/lib/database.types";

export type AgendaProject = Pick<
  Tables<"projects">,
  "id" | "title" | "status" | "scheduled_at"
> & {
  clients: Pick<Tables<"clients">, "name"> | null;
};

// Projetos do mês agrupados por dia (chave YYYY-MM-DD no fuso local)
export type AgendaByDay = Map<string, AgendaProject[]>;
