import Link from "next/link";
import {
  CalendarClock,
  CircleCheckBig,
  FolderKanban,
  HandCoins,
  Rocket,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dayKey, formatTime } from "@/lib/agenda";
import { formatBRL } from "@/lib/format";
import { aggregateEarnings } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EarningsChart } from "@/components/finance/earnings-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/projects/status-badge";
import {
  OnboardingChecklist,
  type OnboardingStep,
} from "@/components/onboarding/onboarding-checklist";

export const metadata = { title: "Dashboard — inDash" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: payments },
    { data: projects },
    { count: activeClients },
    { count: servicesCount },
    { count: multipliersCount },
    { count: tasksCount },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarding_completed").single(),
    supabase.from("payments").select("amount, status, paid_at"),
    supabase
      .from("projects")
      .select(
        "id, title, status, final_price, deadline, scheduled_at, completed_at, clients(name)"
      ),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("archived", false),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("multipliers").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
  ]);

  const allPayments = payments ?? [];
  const allProjects = projects ?? [];

  const hasPaidPayment = allPayments.some((p) => p.status === "pago");
  const coreSteps = [
    {
      id: "servicos",
      label: "Cadastre seus serviços",
      href: "/dashboard/servicos",
      done: (servicesCount ?? 0) > 0,
    },
    {
      id: "clientes",
      label: "Cadastre e agende clientes para seus serviços",
      href: "/dashboard/clientes",
      done:
        (activeClients ?? 0) > 0 &&
        allProjects.some((p) => p.scheduled_at !== null),
    },
    {
      id: "fatores",
      label: "Estipule valores e fatores multiplicativos (ex.: complexidade, prazo)",
      href: "/dashboard/servicos",
      done: (multipliersCount ?? 0) > 0,
    },
    {
      id: "tasks",
      label: "Crie TO-DO lists para cada projeto e vá marcando",
      href: "/dashboard/projetos",
      done: (tasksCount ?? 0) > 0,
    },
    {
      id: "pagamento",
      label: "Receba o pagamento",
      href: "/dashboard/projetos",
      done: hasPaidPayment,
    },
  ];
  const onboardingSteps: OnboardingStep[] = [
    ...coreSteps,
    {
      id: "estatisticas",
      label: "Consulte o Dashboard com as estatísticas e acompanhe seu desempenho",
      href: null,
      done: coreSteps.every((s) => s.done),
    },
  ];
  const checklist = profile?.onboarding_completed ? null : (
    <OnboardingChecklist steps={onboardingSteps} />
  );

  // Primeiro acesso: nada cadastrado ainda — o checklist guia o começo
  if ((servicesCount ?? 0) === 0 && allProjects.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Rocket className="size-10 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold tracking-tight">
            Bem-vindo ao inDash{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="max-w-md text-muted-foreground">
            Seu painel de gestão de freelas. Siga os passos abaixo — em poucos
            minutos você tem tudo rodando.
          </p>
        </div>
        {checklist ?? (
          <div className="text-center">
            <Link href="/dashboard/servicos" className={buttonVariants()}>
              Cadastrar meu primeiro serviço
            </Link>
          </div>
        )}
      </div>
    );
  }

  const paid = allPayments.filter((p) => p.status === "pago");
  const todayKey = dayKey(new Date());
  const [year, month, day] = todayKey.split("-").map(Number);
  const currentPrefix = todayKey.slice(0, 7);
  const prevDate = new Date(year, month - 2, 1);
  const prevPrefix = `${prevDate.getFullYear()}-${String(
    prevDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const prevMonthName = prevDate.toLocaleDateString("pt-BR", { month: "long" });

  const sumByPrefix = (prefix: string) =>
    paid
      .filter((p) => p.paid_at && dayKey(new Date(p.paid_at)).startsWith(prefix))
      .reduce((sum, p) => sum + p.amount, 0);

  const receivedThisMonth = sumByPrefix(currentPrefix);
  const receivedPrevMonth = sumByPrefix(prevPrefix);
  const pending = allPayments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.amount, 0);

  const delta =
    receivedPrevMonth > 0
      ? Math.round(
          ((receivedThisMonth - receivedPrevMonth) / receivedPrevMonth) * 100
        )
      : null;

  const inProgress = allProjects.filter((p) => p.status === "em_andamento");
  const finished = allProjects.filter((p) => p.status === "finalizado");
  const finishedThisMonth = finished.filter(
    (p) =>
      p.completed_at && dayKey(new Date(p.completed_at)).startsWith(currentPrefix)
  );
  const avgTicket =
    finished.length > 0
      ? finished.reduce((sum, p) => sum + p.final_price, 0) / finished.length
      : 0;

  const startOfToday = new Date(year, month - 1, day);
  const weekAhead = new Date(year, month - 1, day + 8);
  const upcoming = allProjects
    .filter(
      (p) =>
        p.scheduled_at &&
        (p.status === "agendado" || p.status === "em_andamento") &&
        new Date(p.scheduled_at) >= startOfToday &&
        new Date(p.scheduled_at) < weekAhead
    )
    .sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!))
    .slice(0, 5);

  const now = new Date();
  const deadlines = allProjects
    .filter(
      (p) =>
        p.deadline &&
        (p.status === "agendado" || p.status === "em_andamento")
    )
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 5);

  const chartData = aggregateEarnings("mes", paid).slice(-6);
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {firstName ? `Olá, ${firstName}!` : "Visão geral"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          O resumo do seu trabalho, num lugar só.
        </p>
      </div>

      {checklist}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Recebido no mês"
          value={formatBRL(receivedThisMonth)}
          valueClassName="text-gradient"
          hint={
            delta === null
              ? "mês atual"
              : `${delta >= 0 ? "+" : ""}${delta}% vs ${prevMonthName}`
          }
          hintClassName={
            delta === null
              ? undefined
              : delta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
          }
        />
        <StatCard
          icon={HandCoins}
          label="A receber"
          value={formatBRL(pending)}
          hint="pagamentos pendentes"
        />
        <StatCard
          icon={FolderKanban}
          label="Em andamento"
          value={String(inProgress.length)}
          hint={`${inProgress.length === 1 ? "projeto ativo" : "projetos ativos"}`}
        />
        <StatCard
          icon={CircleCheckBig}
          label="Finalizados no mês"
          value={String(finishedThisMonth.length)}
          hint="entregas do mês"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ganhos dos últimos 6 meses</CardTitle>
          <CardDescription>
            Pagamentos confirmados —{" "}
            <Link
              href="/dashboard/financeiro"
              className="underline-offset-4 hover:underline"
            >
              ver Financeiro completo
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EarningsChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos agendamentos</CardTitle>
            <CardDescription>Os próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Nada agendado para os próximos dias.
              </p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/dashboard/projetos/${project.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-ring/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.scheduled_at!).toLocaleDateString(
                            "pt-BR",
                            { weekday: "short", day: "numeric", month: "short" }
                          )}{" "}
                          às {formatTime(new Date(project.scheduled_at!))}
                          {project.clients?.name &&
                            ` · ${project.clients.name}`}
                        </p>
                      </div>
                      <StatusBadge
                        status={project.status}
                        className="shrink-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prazos no radar</CardTitle>
            <CardDescription>
              Entregas mais próximas dos projetos ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum projeto ativo com prazo definido.
              </p>
            ) : (
              <ul className="space-y-2">
                {deadlines.map((project) => {
                  const overdue = new Date(project.deadline!) < now;
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/dashboard/projetos/${project.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-ring/60"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {project.title}
                          </p>
                          <p
                            className={cn(
                              "flex items-center gap-1 text-sm",
                              overdue
                                ? "font-medium text-destructive"
                                : "text-muted-foreground"
                            )}
                          >
                            <CalendarClock className="size-3.5" aria-hidden />
                            {new Date(project.deadline!).toLocaleDateString(
                              "pt-BR"
                            )}
                            {overdue && " — atrasado"}
                          </p>
                        </div>
                        <StatusBadge
                          status={project.status}
                          className="shrink-0"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Target}
          label="Ticket médio"
          value={formatBRL(avgTicket)}
          hint="média dos projetos finalizados"
        />
        <StatCard
          icon={Trophy}
          label="Total entregue"
          value={String(finished.length)}
          hint={finished.length === 1 ? "projeto finalizado" : "projetos finalizados"}
        />
        <StatCard
          icon={Users}
          label="Clientes ativos"
          value={String(activeClients ?? 0)}
          hint="não arquivados"
        />
      </div>
    </div>
  );
}
