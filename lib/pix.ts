/**
 * Geração do BR Code (Pix estático) no padrão EMV® QRCPS do Banco Central.
 *
 * É só montagem de string: nenhuma chamada a banco ou gateway. O app do
 * pagador lê a chave, o nome do recebedor e o valor já preenchido.
 *
 * Importante: QR estático não notifica o recebimento — quem confirma o
 * pagamento no inDash continua sendo o usuário.
 */

export type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

export const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "Email",
  telefone: "Telefone",
  aleatoria: "Chave aleatória",
};

/** Campo no formato ID + tamanho (2 dígitos) + valor. */
function field(id: string, value: string) {
  const length = value.length.toString().padStart(2, "0");
  return `${id}${length}${value}`;
}

/**
 * CRC16/CCITT-FALSE — polinômio 0x1021, inicial 0xFFFF, sem reflexão.
 * Calculado sobre o payload inteiro, já incluindo o "6304" final.
 */
function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Bancos costumam recusar acento e minúscula nesses campos. */
function sanitize(text: string, maxLength: number) {
  return text
    // NFD separa o acento em caractere próprio, e o filtro seguinte o remove:
    // "São Paulo" vira "Sao Paulo".
    .normalize("NFD")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

/** Normaliza a chave conforme o tipo (o payload não leva máscara). */
export function normalizePixKey(key: string, type: PixKeyType) {
  const trimmed = key.trim();
  switch (type) {
    case "cpf":
    case "cnpj":
      return trimmed.replace(/\D/g, "");
    case "telefone": {
      const digits = trimmed.replace(/\D/g, "");
      // O padrão exige DDI; assumimos Brasil quando vem só com DDD
      const withCountry =
        digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
      return `+${withCountry}`;
    }
    case "email":
      return trimmed.toLowerCase();
    case "aleatoria":
      return trimmed.toLowerCase();
  }
}

export function isValidPixKey(key: string, type: PixKeyType) {
  const value = normalizePixKey(key, type);
  switch (type) {
    case "cpf":
      return value.length === 11;
    case "cnpj":
      return value.length === 14;
    case "telefone":
      return /^\+\d{12,13}$/.test(value);
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 77;
    case "aleatoria":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        value
      );
  }
}

export function buildPixPayload({
  key,
  keyType,
  merchantName,
  merchantCity,
  amount,
  txid = "***",
}: {
  key: string;
  keyType: PixKeyType;
  merchantName: string;
  merchantCity: string;
  /** Em reais. Omitido quando ausente: o pagador digita o valor. */
  amount?: number;
  txid?: string;
}) {
  const merchantAccount =
    field("00", "br.gov.bcb.pix") + field("01", normalizePixKey(key, keyType));

  let payload =
    field("00", "01") + // versão do payload
    field("26", merchantAccount) +
    field("52", "0000") + // categoria do estabelecimento: não informada
    field("53", "986"); // moeda: BRL

  if (amount && amount > 0) {
    payload += field("54", amount.toFixed(2));
  }

  payload +=
    field("58", "BR") +
    field("59", sanitize(merchantName, 25) || "RECEBEDOR") +
    field("60", sanitize(merchantCity, 15) || "BRASIL") +
    field("62", field("05", sanitize(txid, 25) || "***"));

  // O CRC entra por último, calculado sobre tudo mais o próprio "6304"
  const withCrcMarker = `${payload}6304`;
  return `${withCrcMarker}${crc16(withCrcMarker)}`;
}
