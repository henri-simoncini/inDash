const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const factor = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number) {
  return brl.format(value);
}

export function formatFactor(value: number) {
  return `×${factor.format(value)}`;
}
