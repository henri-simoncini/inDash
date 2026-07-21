import { z } from "zod";

export const paymentSchema = z.object({
  amount: z
    .number({ message: "Informe um valor válido." })
    .positive("O valor precisa ser maior que zero."),
  status: z.enum(["pendente", "pago"]),
  // Data do pagamento (YYYY-MM-DD) — usada quando status = pago
  paidAt: z.string().optional(),
  method: z.string().optional(),
});

export type PaymentValues = z.infer<typeof paymentSchema>;

export const PAYMENT_METHODS = [
  "Pix",
  "Transferência",
  "Dinheiro",
  "Cartão",
  "Outro",
] as const;
