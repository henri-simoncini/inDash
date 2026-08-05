import {
  Banknote,
  Briefcase,
  CalendarClock,
  CircleCheckBig,
  CreditCard,
  FolderKanban,
  HandCoins,
  QrCode,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dayKey } from "@/lib/agenda";
import { formatBRL } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Estatísticas — inDash" };

// A coluna method é texto livre; o formulário grava os rótulos de
// PAYMENT_METHODS. Pix e Dinheiro saem separados e o resto vira "outras".
function methodGroup(method: string | null) {
  const value = (method ?? "").trim().toLowerCase();
  if (value === "pix") return "pix" as const;
  if (value === "dinheiro") return "dinheiro" as const;
  return "outras" as const;
}

export default async function EstatisticasPage() {
  const supabase = await createClient();

  const [{ data: payments }, { data: projects }, { data: services }] =
    await Promise.all([
      supabase.from("payments").select("amount, status, method, paid_at"),
      supabase
        .from("projects")
        .select("id, status, final_price, service_id, completed_at, deadline"),
      supabase.from("services").select("id, name, active"),
    ]);

  const allPayments = payments ?? [];
  const allProjects = projects ?? [];
  const allServices = services ?? [];

  const paid = allPayments.filter((p) => p.status === "pago");
  const totalRecebido = paid.reduce((sum, p) => sum + p.amount, 0);
  const aReceber = allPayments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.amount, 0);

  // Mês atual e anterior para a variação
  const todayKey = dayKey(new Date());
  const [year, month] = todayKey.split("-").map(Number);
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

  const recebidoNoMes = sumByPrefix(currentPrefix);
  const recebidoMesAnterior = sumByPrefix(prevPrefix);
  const delta =
    recebidoMesAnterior > 0
      ? Math.round(
          ((recebidoNoMes - recebidoMesAnterior) / recebidoMesAnterior) * 100
        )
      : null;

  const agendados = allProjects.filter((p) => p.status === "agendado");
  const emAndamento = allProjects.filter((p) => p.status === "em_andamento");
  const entregues = allProjects.filter((p) => p.status === "finalizado");

  const ticketMedio =
    entregues.length > 0
      ? entregues.reduce((sum, p) => sum + p.final_price, 0) / entregues.length
      : 0;

  // Pontualidade só faz sentido em quem tinha prazo definido
  const entreguesComPrazo = entregues.filter(
    (p) => p.deadline && p.completed_at
  );
  const noPrazo = entreguesComPrazo.filter(
    (p) => new Date(p.completed_at!) <= new Date(p.deadline!)
  );
  const pontualidade =
    entreguesComPrazo.length > 0
      ? Math.round((noPrazo.length / entreguesComPrazo.length) * 100)
      : null;

  // Serviço mais vendido: quantos projetos cada serviço gerou
  const porServico = new Map<string, number>();
  for (const project of allProjects) {
    porServico.set(
      project.service_id,
      (porServico.get(project.service_id) ?? 0) + 1
    );
  }
  const maisVendido = [...porServico.entries()].sort((a, b) => b[1] - a[1])[0];
  const nomeMaisVendido = maisVendido
    ? (allServices.find((s) => s.id === maisVendido[0])?.name ?? "Serviço removido")
    : null;

  const porMetodo = { pix: 0, dinheiro: 0, outras: 0 };
  for (const payment of paid) {
    porMetodo[methodGroup(payment.method)] += payment.amount;
  }
  const recebimentos = [
    {
      chave: "pix",
      label: "Pix",
      icon: QrCode,
      valor: porMetodo.pix,
    },
    {
      chave: "dinheiro",
      label: "Dinheiro",
      icon: Banknote,
      valor: porMetodo.dinheiro,
    },
    {
      chave: "outras",
      label: "Outras formas",
      icon: CreditCard,
      valor: porMetodo.outras,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estatísticas</h1>
        <p className="mt-1 text-muted-foreground">
          Como o seu trabalho vem rendendo, em números.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Desempenho em dinheiro
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label="Recebido no total"
            value={formatBRL(totalRecebido)}
            valueClassName="text-gradient"
            hint="todos os pagamentos confirmados"
          />
          <StatCard
            icon={TrendingUp}
            label="Recebido no mês"
            value={formatBRL(recebidoNoMes)}
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
            value={formatBRL(aReceber)}
            hint="pagamentos pendentes"
          />
          <StatCard
            icon={Target}
            label="Ticket médio"
            value={formatBRL(ticketMedio)}
            hint="média dos projetos entregues"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Projetos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="Em andamento"
            value={String(emAndamento.length)}
            hint={emAndamento.length === 1 ? "projeto ativo" : "projetos ativos"}
          />
          <StatCard
            icon={CalendarClock}
            label="Agendados"
            value={String(agendados.length)}
            hint="ainda não iniciados"
          />
          <StatCard
            icon={CircleCheckBig}
            label="Entregues"
            value={String(entregues.length)}
            hint={
              entregues.length === 1
                ? "projeto finalizado"
                : "projetos finalizados"
            }
          />
          <StatCard
            icon={Trophy}
            label="Entrega no prazo"
            value={pontualidade === null ? "—" : `${pontualidade}%`}
            hint={
              pontualidade === null
                ? "nenhuma entrega com prazo definido"
                : `${noPrazo.length} de ${entreguesComPrazo.length} dentro do prazo`
            }
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recebimentos por forma de pagamento</CardTitle>
            <CardDescription>
              Só entram os pagamentos já confirmados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalRecebido === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhum pagamento confirmado ainda.
              </p>
            ) : (
              <ul className="space-y-4">
                {recebimentos.map(({ chave, label, icon: Icon, valor }) => {
                  const fatia = Math.round((valor / totalRecebido) * 100);
                  return (
                    <li key={chave} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-sm">
                          <Icon
                            className="size-4 text-muted-foreground"
                            aria-hidden
                          />
                          {label}
                        </span>
                        <span className="font-heading text-xl leading-none">
                          {formatBRL(valor)}
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${label}: ${fatia}% do recebido`}
                      >
                        <div
                          className="bg-gradient-brand h-full rounded-full"
                          style={{ width: `${fatia}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fatia}% do total recebido
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
            <CardDescription>
              O que você oferece e o que mais sai.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={Briefcase}
                label="Serviços oferecidos"
                value={String(allServices.length)}
                hint={`${allServices.filter((s) => s.active).length} ativos`}
              />
              <StatCard
                icon={Trophy}
                label="Projetos no total"
                value={String(allProjects.length)}
                hint="incluindo cancelados"
              />
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Serviço mais vendido</p>
              {nomeMaisVendido === null ? (
                <p className="mt-1 text-sm">
                  Nenhum projeto cadastrado ainda.
                </p>
              ) : (
                <>
                  <p className="mt-1 truncate font-heading text-2xl leading-none">
                    {nomeMaisVendido}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {maisVendido![1]}{" "}
                    {maisVendido![1] === 1 ? "projeto" : "projetos"} gerados
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
