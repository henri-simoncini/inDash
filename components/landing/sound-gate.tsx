"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  isMuted,
  loadMutePreference,
  primeTypeSound,
  setMuted,
  subscribeMute,
} from "@/lib/type-sound";

/**
 * Destrava o áudio no primeiro gesto do usuário (política do navegador:
 * scroll não libera som, só clique/toque/tecla) e oferece o controle de mudo,
 * porque som automático sem como desligar é problema de acessibilidade.
 */
export function SoundGate() {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    loadMutePreference();
    setMutedState(isMuted());
    const unsubscribe = subscribeMute(setMutedState);

    const prime = () => void primeTypeSound();
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", prime, opts);
    window.addEventListener("keydown", prime, opts);
    window.addEventListener("touchstart", prime, opts);

    return () => {
      unsubscribe();
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
      window.removeEventListener("touchstart", prime);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        void primeTypeSound();
        setMuted(!muted);
      }}
      aria-pressed={muted}
      aria-label={muted ? "Ativar som de digitação" : "Desativar som de digitação"}
      title={muted ? "Ativar som" : "Desativar som"}
      className="fixed bottom-4 right-4 z-40 inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:text-white"
    >
      {muted ? (
        <VolumeX className="size-4" aria-hidden />
      ) : (
        <Volume2 className="size-4" aria-hidden />
      )}
    </button>
  );
}
