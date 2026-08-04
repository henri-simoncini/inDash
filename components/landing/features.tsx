import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";
import { TypedBlock } from "@/components/landing/typed-block";

function FeatureSection({
  id,
  icon: Icon,
  eyebrow,
  title,
  accent,
  description,
  mockup,
  reverse,
}: {
  id?: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  /** Trecho final do título destacado em azul */
  accent?: string;
  description: string;
  mockup: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="px-4 py-14">
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row",
          reverse && "lg:flex-row-reverse"
        )}
      >
        <div className="flex-1 space-y-3">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Icon className="size-3.5" aria-hidden /> {eyebrow}
          </p>
          <TypedBlock title={title} accent={accent}>
            <p className="max-w-md text-muted-foreground">{description}</p>
          </TypedBlock>
        </div>
        <Reveal
          direction={reverse ? "left" : "right"}
          delay={120}
          className="w-full max-w-md flex-1"
        >
          <div aria-hidden>{mockup}</div>
        </Reveal>
      </div>
    </section>
  );
}

function AgendaMockup() {
  const chips: Record<number, { label: string; className: string }> = {
    9: { label: "14h Logo", className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
    16: { label: "10h Site", className: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200" },
    23: { label: "15h Social", className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" },
  };
  return (
    <div className="rounded-xl border bg-card p-4 shadow-md">
      <p className="text-sm font-medium">Julho</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {Array.from({ length: 28 }, (_, i) => {
          const chip = chips[i + 1];
          return (
            <div
              key={i}
              className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded border text-[10px]"
            >
              <span>{i + 1}</span>
              {chip && (
                <span
                  className={cn(
                    "w-full truncate rounded-sm px-0.5 text-[7px] leading-tight",
                    chip.className
                  )}
                >
                  {chip.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientsMockup() {
  const clients = [
    { name: "Padaria Estrela", detail: "2 projetos · R$ 1.900" },
    { name: "Ana Fotografia", detail: "1 projeto · R$ 750" },
    { name: "Studio Mova", detail: "3 projetos · R$ 4.100" },
  ];
  return (
    <div className="rounded-xl border bg-card p-4 shadow-md">
      <div className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground">
        Buscar por nome ou email...
      </div>
      <ul className="mt-3 space-y-2">
        {clients.map((client) => (
          <li
            key={client.name}
            className="flex items-center gap-3 rounded-lg border p-2.5"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {client.name[0]}
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FinanceMockup() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card p-4 shadow-md">
        <p className="text-left text-xs text-muted-foreground">
          Preço calculado na hora
        </p>
        <p className="mt-2 text-left text-sm">
          <span className="font-medium tabular-nums">R$ 800</span>
          <span className="text-muted-foreground"> base</span>
          <span className="text-muted-foreground"> × </span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Urgente ×1,5
          </span>
          <span className="text-muted-foreground"> = </span>
          <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            R$ 1.200
          </span>
        </p>
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-md">
        <div className="flex items-center justify-between text-left text-xs text-muted-foreground">
          <span>Recebido</span>
          <span className="font-medium text-foreground">R$ 600 de R$ 1.200</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function StatsMockup() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { label: "Ticket médio", value: "R$ 980" },
        { label: "Entregues", value: "23" },
        { label: "No prazo", value: "96%" },
        { label: "Clientes ativos", value: "12" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border bg-card p-4 text-left shadow-md"
        >
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function BoardMockup() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-md">
      <p className="inline-block border-b border-primary pb-0.5 text-left text-xs font-semibold uppercase tracking-wide text-primary">
        Em andamento
      </p>
      <div className="mt-3 space-y-2">
        {[
          {
            title: "Logo da Padaria Estrela",
            percent: 60,
            progress: "3/5 tarefas",
            price: "R$ 1.200,00",
          },
          {
            title: "Site da Ana Fotografia",
            percent: 25,
            progress: "1/4 tarefas",
            price: "R$ 750,00",
          },
        ].map((project) => (
          <div
            key={project.title}
            className="flex items-center gap-3 rounded-lg border border-white/10 p-3 text-left"
          >
            <div className="shrink-0 text-center leading-none">
              <p className="font-heading text-4xl">
                <span className="text-gradient">{project.percent}</span>
                <span className="text-gradient align-bottom text-xl">%</span>
              </p>
              <p className="mt-1 text-[0.7rem] text-white">Concluído</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.title}</p>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.progress}</span>
                <span className="font-heading text-2xl text-foreground">
                  {project.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  return (
    <div id="recursos" className="border-t border-white/5 bg-white/[0.02]">
      <FeatureSection
        icon={LayoutDashboard}
        eyebrow="Projetos"
        title="Do agendamento à entrega, sem"
        accent="post-it."
        description="Cada projeto tem cliente, serviço, prazo e uma TO-DO list própria. O mural mostra tudo por status — e finaliza só quando as tarefas acabam."
        mockup={<BoardMockup />}
      />
      <FeatureSection
        icon={CalendarDays}
        eyebrow="Agenda"
        title="Sua semana num calendário"
        accent="limpo."
        description="Projetos agendados aparecem no mês, com horário e status. Clicou, caiu no projeto."
        mockup={<AgendaMockup />}
        reverse
      />
      <FeatureSection
        icon={Users}
        eyebrow="Clientes"
        title="Todo cliente com histórico e contato"
        accent="à mão."
        description="Busca rápida, notas e a lista de projetos de cada um. Sem caçar conversa antiga no WhatsApp."
        mockup={<ClientsMockup />}
      />
      <FeatureSection
        icon={Wallet}
        eyebrow="Financeiro"
        title="Preço justo, calculado —"
        accent="e recebido."
        description="Fatores multiplicativos (urgência, complexidade) ajustam o preço na criação do projeto. Depois é registrar pagamentos e ver o que falta entrar."
        mockup={<FinanceMockup />}
        reverse
      />
      <FeatureSection
        icon={BarChart3}
        eyebrow="Estatísticas"
        title="Seu desempenho,"
        accent="em números."
        description="Ganhos por dia, semana, mês e ano. Ticket médio, entregas e comparação com o mês anterior — pra decidir com dados, não no chute."
        mockup={<StatsMockup />}
      />
    </div>
  );
}
