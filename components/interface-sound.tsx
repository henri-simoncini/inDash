"use client";

import { useEffect } from "react";
import {
  loadMutePreference,
  playClick,
  primeTypeSound,
} from "@/lib/type-sound";

const CLICKABLE = [
  "a",
  "button",
  '[role="button"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[role="checkbox"]',
  '[role="switch"]',
  "summary",
].join(",");

/**
 * Som de clique da interface, como no portfólio.
 *
 * Também destrava o áudio: navegadores só liberam som depois de um gesto do
 * usuário, e o próprio clique serve de gatilho.
 */
export function InterfaceSound() {
  useEffect(() => {
    loadMutePreference();

    const onPointerDown = () => void primeTypeSound();
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(CLICKABLE)) playClick();
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
