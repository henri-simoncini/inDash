import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome do cliente."),
  email: z
    .string()
    .email("Informe um email válido.")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30, "Telefone longo demais.").optional(),
  notes: z.string().max(1000, "Notas longas demais.").optional(),
});

export type ClientValues = z.infer<typeof clientSchema>;
