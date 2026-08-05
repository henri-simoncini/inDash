"use client";

import { useEffect } from "react";
import {
  loadMutePreference,
  playClick,
  playKey,
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

// Onde a digitação faz sentido: campos de texto de verdade. Checkbox, botão
// e afins também são <input>, mas ali o barulho seria o de clique.
const TEXT_INPUT_TYPES = new Set([
  "text",
  "email",
  "password",
  "search",
  "tel",
  "url",
  "number",
  "date",
  "datetime-local",
  "time",
]);

function isTextField(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return TEXT_INPUT_TYPES.has(el.type);
  return false;
}

/**
 * Sons de clique e de digitação da interface, como no portfólio.
 *
 * Também destrava o áudio: navegadores só liberam som depois de um gesto do
 * usuário, e o próprio clique ou a primeira tecla servem de gatilho.
 * O mudo fica em Configurações e vale para os dois sons.
 */
export function InterfaceSound() {
  useEffect(() => {
    loadMutePreference();

    const prime = () => void primeTypeSound();
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(CLICKABLE)) playClick();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // Atalho (Ctrl+S, Cmd+V...) não é digitação
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (!isTextField(event.target)) return;
      // Caractere digitado, mais apagar e confirmar — setas e Tab ficam de fora
      const isChar = event.key.length === 1;
      if (isChar || event.key === "Backspace" || event.key === "Enter") {
        playKey();
      }
    };

    window.addEventListener("pointerdown", prime, { passive: true });
    window.addEventListener("keydown", prime, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
