"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  isMuted,
  loadMutePreference,
  primeTypeSound,
  setMuted,
  subscribeMute,
} from "@/lib/type-sound";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * Liga e desliga os sons da interface (clique e digitação).
 *
 * Fica no navegador, e não na conta: som é decisão de aparelho — dá para
 * querer silêncio no trabalho e som em casa, com o mesmo login. O botão de
 * mudo da landing usa o mesmo estado, então os dois andam juntos.
 */
export function SoundSettings() {
  // Começa ligado para bater com o servidor; o efeito corrige logo em seguida
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    loadMutePreference();
    setMutedState(isMuted());
    return subscribeMute(setMutedState);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Som</CardTitle>
        <CardDescription>
          Vale para este navegador, não para a conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-3 sm:max-w-md">
          <div>
            <Label htmlFor="interface-sound" className="flex items-center gap-1.5">
              <Volume2 className="size-4" aria-hidden /> Sons da interface
            </Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cliques nos botões e teclas ao digitar.
            </p>
          </div>
          <Switch
            id="interface-sound"
            checked={!muted}
            onCheckedChange={(checked) => {
              // Destrava o áudio no mesmo gesto que liga o som, senão o
              // navegador só libera na próxima interação
              void primeTypeSound();
              setMuted(!checked);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
