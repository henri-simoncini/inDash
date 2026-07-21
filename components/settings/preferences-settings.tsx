"use client";

import { useState, useTransition } from "react";
import { Contrast, Mail, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { applyPreferences } from "@/lib/apply-preferences";
import type { PreferencesValues } from "@/lib/validations/preferences";
import { updatePreferences } from "@/app/dashboard/configuracoes/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

const FONT_SIZES = [
  { value: "sm", label: "Pequena", sample: "text-sm" },
  { value: "md", label: "Média", sample: "text-base" },
  { value: "lg", label: "Grande", sample: "text-lg" },
] as const;

const FONT_FAMILIES = [
  { value: "sans", label: "Padrão", className: "font-sans" },
  { value: "serif", label: "Clássica", className: "font-serif" },
  { value: "mono", label: "Mono", className: "font-mono" },
] as const;

export function PreferencesSettings({
  initial,
}: {
  initial: PreferencesValues;
}) {
  const [prefs, setPrefs] = useState(initial);
  const [, startTransition] = useTransition();

  function save(next: PreferencesValues) {
    setPrefs(next);
    applyPreferences(next);
    startTransition(async () => {
      const result = await updatePreferences(next);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            As mudanças valem na hora e ficam salvas na sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={prefs.theme === value ? "default" : "outline"}
                  aria-pressed={prefs.theme === value}
                  onClick={() => save({ ...prefs, theme: value })}
                >
                  <Icon /> {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tamanho da fonte</Label>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {FONT_SIZES.map(({ value, label, sample }) => (
                <Button
                  key={value}
                  type="button"
                  variant={prefs.fontSize === value ? "default" : "outline"}
                  aria-pressed={prefs.fontSize === value}
                  onClick={() => save({ ...prefs, fontSize: value })}
                >
                  <span className={sample}>A</span> {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estilo da fonte</Label>
            <div className="grid grid-cols-3 gap-2 sm:max-w-md">
              {FONT_FAMILIES.map(({ value, label, className }) => (
                <Button
                  key={value}
                  type="button"
                  variant={prefs.fontFamily === value ? "default" : "outline"}
                  aria-pressed={prefs.fontFamily === value}
                  onClick={() => save({ ...prefs, fontFamily: value })}
                >
                  <span className={cn("text-base", className)}>Aa</span> {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 sm:max-w-md">
            <div>
              <Label htmlFor="high-contrast" className="flex items-center gap-1.5">
                <Contrast className="size-4" aria-hidden /> Alto contraste
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Bordas e textos secundários mais fortes.
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={prefs.highContrast}
              onCheckedChange={(checked) =>
                save({ ...prefs, highContrast: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>
            Como o inDash pode falar com você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3 sm:max-w-md">
            <div>
              <Label
                htmlFor="email-notifications"
                className="flex items-center gap-1.5"
              >
                <Mail className="size-4" aria-hidden /> Notificações por email
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Usaremos quando houver resumos e avisos por email.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={prefs.emailNotifications}
              onCheckedChange={(checked) =>
                save({ ...prefs, emailNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
