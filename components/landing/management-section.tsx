import { BarChart3, MoveRight } from "lucide-react";
import { ScrollChart } from "@/components/landing/scroll-chart";
import { TypedBlock } from "@/components/landing/typed-block";

const BULLETS = [
  "Lista de tarefas por projeto",
  "Prazos que avisam",
  "Preço calculado",
];

export function ManagementSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <ScrollChart />

        <div className="space-y-4">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <BarChart3 className="size-3.5" aria-hidden /> Gestão
          </p>
          <TypedBlock title="Gerencie seus projetos" accent=".">
            <p className="max-w-md text-muted-foreground">
              Pare de rastrear entrega em conversa de WhatsApp. Cadastre o
              projeto, marque as tarefas conforme avança e veja num olhar o que
              está agendado, em andamento e finalizado.
            </p>
            <ul className="mt-6 space-y-3">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <MoveRight className="size-3.5" aria-hidden />
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </TypedBlock>
        </div>
      </div>
    </section>
  );
}
