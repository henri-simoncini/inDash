import { z } from "zod";

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.enum(["sm", "md", "lg"]),
  fontFamily: z.enum(["sans", "serif", "mono"]),
  highContrast: z.boolean(),
  emailNotifications: z.boolean(),
});

export const profileNameSchema = z.object({
  fullName: z.string().min(2, "Informe seu nome."),
});

export type PreferencesValues = z.infer<typeof preferencesSchema>;
export type ProfileNameValues = z.infer<typeof profileNameSchema>;
