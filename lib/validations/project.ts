import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2, "Informe o título do projeto."),
  clientId: z.string().min(1, "Escolha o cliente."),
  serviceId: z.string().min(1, "Escolha o serviço."),
  basePrice: z
    .number({ message: "Informe um preço válido." })
    .min(0, "O preço não pode ser negativo."),
  scheduledAt: z.string().optional(),
  deadline: z.string().optional(),
  multiplierIds: z.array(z.string()),
});

// Edição não mexe em serviço nem nos fatores aplicados (snapshot preservado)
export const projectUpdateSchema = projectSchema.omit({
  serviceId: true,
  multiplierIds: true,
});

export const taskSchema = z.object({
  title: z.string().min(1, "Escreva a tarefa.").max(200, "Tarefa longa demais."),
});

// Observação da tarefa: texto livre, e vazio significa apagar a observação
export const taskNotesSchema = z.object({
  notes: z.string().max(2000, "Observação longa demais."),
});

export type ProjectValues = z.infer<typeof projectSchema>;
export type ProjectUpdateValues = z.infer<typeof projectUpdateSchema>;
export type TaskValues = z.infer<typeof taskSchema>;
