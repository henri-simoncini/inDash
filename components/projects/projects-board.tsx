"use client";

import { useMemo, useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import type { Tables } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import type { ProjectListItem } from "@/components/projects/types";

type Client = Pick<Tables<"clients">, "id" | "name">;
type Service = Pick<Tables<"services">, "id" | "name" | "base_price">;
type Multiplier = Tables<"multipliers">;

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title} <span className="font-normal">({count})</span>
      </h2>
      {children}
    </section>
  );
}

export function ProjectsBoard({
  projects,
  clients,
  services,
  multipliers,
}: {
  projects: ProjectListItem[];
  clients: Client[];
  services: Service[];
  multipliers: Multiplier[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  const groups = useMemo(() => {
    const agendados = projects
      .filter((p) => p.status === "agendado")
      .sort((a, b) =>
        (a.scheduled_at ?? "9999").localeCompare(b.scheduled_at ?? "9999")
      );
    const emAndamento = projects.filter((p) => p.status === "em_andamento");
    const finalizados = projects.filter((p) => p.status === "finalizado");
    const cancelados = projects.filter((p) => p.status === "cancelado");

    // "Em andamento" agrupado por serviço (a categoria do mural)
    const porServico = new Map<string, ProjectListItem[]>();
    for (const project of emAndamento) {
      const key = project.services?.name ?? "Sem serviço";
      porServico.set(key, [...(porServico.get(key) ?? []), project]);
    }

    return { agendados, porServico, finalizados, cancelados };
  }, [projects]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="mt-1 text-muted-foreground">
            Seu mural de trabalho: do agendamento à entrega.
          </p>
        </div>
        {projects.length > 0 && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus /> Novo projeto
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <FolderKanban className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">Nenhum projeto ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie seu primeiro projeto escolhendo um cliente e um serviço — o
              preço é calculado com seus fatores multiplicativos.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus /> Criar projeto
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.agendados.length > 0 && (
            <Section title="Agendados" count={groups.agendados.length}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.agendados.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </Section>
          )}

          {groups.porServico.size > 0 && (
            <Section
              title="Em andamento"
              count={[...groups.porServico.values()].reduce(
                (total, list) => total + list.length,
                0
              )}
            >
              <div className="space-y-4">
                {[...groups.porServico.entries()].map(([serviceName, list]) => (
                  <div key={serviceName} className="space-y-2">
                    <h3 className="text-sm font-medium">{serviceName}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {groups.finalizados.length > 0 && (
            <Section title="Finalizados" count={groups.finalizados.length}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.finalizados.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </Section>
          )}

          {groups.cancelados.length > 0 && (
            <Section title="Cancelados" count={groups.cancelados.length}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.cancelados.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        services={services}
        multipliers={multipliers}
      />
    </div>
  );
}
