import type { Tables } from "@/lib/database.types";

// Projeto com as relações carregadas para o mural e listas
export type ProjectListItem = Tables<"projects"> & {
  clients: Pick<Tables<"clients">, "name"> | null;
  services: Pick<Tables<"services">, "name"> | null;
  tasks: Pick<Tables<"tasks">, "done">[];
};
