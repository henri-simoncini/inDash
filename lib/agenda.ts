const TIME_ZONE = "America/Sao_Paulo";

// Chave de dia (YYYY-MM-DD) no fuso do usuário, independente do fuso do servidor
export function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Dias de calendário entre hoje e a data, no fuso do usuário.
 * A conta é feita em UTC sobre as datas já normalizadas para o fuso, senão
 * uma virada de horário de verão faria a diferença dar 0,96 ou 1,04 de dia.
 */
export function daysUntil(iso: string) {
  const toUTC = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const diff = toUTC(dayKey(new Date(iso))) - toUTC(dayKey(new Date()));
  return Math.round(diff / 86_400_000);
}

/** Texto do prazo em relação a hoje: "vence hoje", "em 3 dias", "atrasado..." */
export function deadlineLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) {
    const late = Math.abs(days);
    return late === 1 ? "atrasado há 1 dia" : `atrasado há ${late} dias`;
  }
  if (days === 0) return "vence hoje";
  if (days === 1) return "vence amanhã";
  return `em ${days} dias`;
}

export function monthLabel(year: number, month: number) {
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function parseMonthParam(value: string | undefined) {
  const match = value?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const now = new Date();
  const [year, month] = dayKey(now).split("-").map(Number);
  return { year, month };
}

export function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
