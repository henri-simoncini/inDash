import { z } from "zod";
import { isValidPixKey, type PixKeyType } from "@/lib/pix";

export const pixSettingsSchema = z
  .object({
    keyType: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"]),
    key: z.string().min(1, "Informe sua chave Pix."),
    name: z
      .string()
      .min(2, "Informe o nome que aparece para quem paga.")
      .max(25, "Máximo de 25 caracteres."),
    city: z
      .string()
      .min(2, "Informe a cidade.")
      .max(15, "Máximo de 15 caracteres."),
  })
  .refine((data) => isValidPixKey(data.key, data.keyType as PixKeyType), {
    message: "Chave inválida para o tipo escolhido.",
    path: ["key"],
  });

export type PixSettingsValues = z.infer<typeof pixSettingsSchema>;
