import { dayKey } from "@/lib/agenda";

export type FinancePeriod = "dia" | "semana" | "mes" | "ano";

export type EarningsBucket = { key: string; label: string; total: number };

export const PERIOD_LABELS: Record<FinancePeriod, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
  ano: "Ano",
};

export const PERIOD_DESCRIPTIONS: Record<FinancePeriod, string> = {
  dia: "últimos 30 dias",
  semana: "últimas 12 semanas",
  mes: "últimos 12 meses",
  ano: "todos os anos",
};

const pad = (n: number) => String(n).padStart(2, "0");

// "Hoje" como data de calendário no fuso do usuário
function localToday() {
  const [y, m, d] = dayKey(new Date()).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function keyOf(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function mondayOf(date: Date) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
}

type PaidPayment = { amount: number; paid_at: string | null };

// Soma pagamentos pagos em buckets do período (regra: agrupado por paid_at)
export function aggregateEarnings(
  period: FinancePeriod,
  payments: PaidPayment[]
): EarningsBucket[] {
  const paid = payments.filter((p) => p.paid_at !== null);
  const today = localToday();
  const buckets = new Map<string, EarningsBucket>();

  const add = (key: string, amount: number) => {
    const bucket = buckets.get(key);
    if (bucket) bucket.total += amount;
  };

  if (period === "dia") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(keyOf(d), {
        key: keyOf(d),
        label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        total: 0,
      });
    }
    for (const p of paid) add(dayKey(new Date(p.paid_at!)), p.amount);
  } else if (period === "semana") {
    const monday = mondayOf(today);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(monday);
      d.setDate(d.getDate() - 7 * i);
      buckets.set(keyOf(d), {
        key: keyOf(d),
        label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
        total: 0,
      });
    }
    for (const p of paid) {
      const [y, m, d] = dayKey(new Date(p.paid_at!)).split("-").map(Number);
      add(keyOf(mondayOf(new Date(y, m - 1, d))), p.amount);
    }
  } else if (period === "mes") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const month = d.toLocaleDateString("pt-BR", { month: "short" });
      buckets.set(key, {
        key,
        label: `${month.replace(".", "")}/${String(d.getFullYear()).slice(2)}`,
        total: 0,
      });
    }
    for (const p of paid) add(dayKey(new Date(p.paid_at!)).slice(0, 7), p.amount);
  } else {
    const years = new Set<string>([String(today.getFullYear())]);
    for (const p of paid) years.add(dayKey(new Date(p.paid_at!)).slice(0, 4));
    for (const year of [...years].sort()) {
      buckets.set(year, { key: year, label: year, total: 0 });
    }
    for (const p of paid) add(dayKey(new Date(p.paid_at!)).slice(0, 4), p.amount);
  }

  return [...buckets.values()];
}
