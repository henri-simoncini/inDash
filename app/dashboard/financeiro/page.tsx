import Link from "next/link";
import { HandCoins, TrendingUp, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import {
  aggregateEarnings,
  PERIOD_DESCRIPTIONS,
  type FinancePeriod,
} from "@/lib/finance";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EarningsChart } from "@/components/finance/earnings-chart";
import { PeriodTabs } from "@/components/finance/period-tabs";
import {
  PaymentsTable,
  type PaymentListItem,
} from "@/components/finance/payments-table";

export const metadata = { title: "Financeiro — inDash" };

const PERIODS: FinancePeriod[] = ["dia", "semana", "mes", "ano"];

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;
  const period: FinancePeriod = PERIODS.includes(periodo as FinancePeriod)
    ? (periodo as FinancePeriod)
    : "mes";

  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("*, projects(id, title, clients(name))")
    .order("created_at", { ascending: false });

  const payments = (data ?? []) as PaymentListItem[];
  const paid = payments.filter((p) => p.status === "pago");
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pendente")
    .reduce((sum, p) => sum + p.amount, 0);

  const buckets = aggregateEarnings(period, paid);
  const periodTotal = buckets.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="mt-1 text-muted-foreground">
          Seus ganhos, período a período. Só pagamentos confirmados entram nas
          estatísticas.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center">
          <Wallet className="size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">Nenhum pagamento registrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Registre pagamentos na página de cada projeto — eles aparecem
              aqui somados por dia, semana, mês e ano.
            </p>
          </div>
          <Link href="/dashboard/projetos" className={buttonVariants()}>
            Ir para projetos
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="gap-2 py-5">
              <CardHeader className="pb-0">
                <CardDescription className="flex items-center gap-1.5">
                  <TrendingUp className="size-4" aria-hidden /> Recebido no
                  período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl leading-none">
                  {formatBRL(periodTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PERIOD_DESCRIPTIONS[period]}
                </p>
              </CardContent>
            </Card>
            <Card className="gap-2 py-5">
              <CardHeader className="pb-0">
                <CardDescription className="flex items-center gap-1.5">
                  <Wallet className="size-4" aria-hidden /> Recebido total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl leading-none">
                  {formatBRL(totalPaid)}
                </p>
                <p className="text-xs text-muted-foreground">
                  desde o início
                </p>
              </CardContent>
            </Card>
            <Card className="gap-2 py-5">
              <CardHeader className="pb-0">
                <CardDescription className="flex items-center gap-1.5">
                  <HandCoins className="size-4" aria-hidden /> A receber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-4xl leading-none">
                  {formatBRL(totalPending)}
                </p>
                <p className="text-xs text-muted-foreground">
                  pagamentos pendentes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Ganhos</CardTitle>
                <CardDescription>
                  Pagamentos confirmados, {PERIOD_DESCRIPTIONS[period]}
                </CardDescription>
              </div>
              <PeriodTabs period={period} />
            </CardHeader>
            <CardContent>
              <EarningsChart data={buckets} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos pagamentos</CardTitle>
              <CardDescription>
                Os 15 registros mais recentes — confirme pendentes ou corrija
                erros por aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsTable payments={payments.slice(0, 15)} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
