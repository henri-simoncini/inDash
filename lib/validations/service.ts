import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Informe o nome do serviço."),
  description: z.string().max(500, "Descrição longa demais.").optional(),
  basePrice: z
    .number({ message: "Informe um preço válido." })
    .min(0, "O preço não pode ser negativo."),
  active: z.boolean(),
});

export const multiplierSchema = z.object({
  name: z.string().min(2, "Informe o nome do fator."),
  kind: z.enum(["complexity", "deadline", "custom"], {
    message: "Escolha o tipo do fator.",
  }),
  factor: z
    .number({ message: "Informe um fator válido." })
    .positive("O fator precisa ser maior que zero."),
  // "global" = vale para todos os serviços; senão, id do serviço
  serviceId: z.string().min(1, "Escolha o escopo."),
});

export type ServiceValues = z.infer<typeof serviceSchema>;
export type MultiplierValues = z.infer<typeof multiplierSchema>;
