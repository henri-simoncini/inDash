import { z } from "zod";

export const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Use pelo menos 8 caracteres."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não conferem.",
    path: ["confirm"],
  });

export const emailSchema = z.object({
  email: z.string().email("Informe um email válido."),
});

export type SetPasswordValues = z.infer<typeof setPasswordSchema>;
export type EmailValues = z.infer<typeof emailSchema>;
