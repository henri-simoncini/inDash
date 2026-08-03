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

/**
 * Monta o link do WhatsApp a partir do telefone digitado pelo usuário.
 * O wa.me só aceita dígitos com DDI; assumimos Brasil quando o número vem
 * sem código de país (10 ou 11 dígitos, com DDD).
 */
export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}
