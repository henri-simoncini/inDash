"use client";

import { useEffect } from "react";
import { applyPreferences, type AppearancePrefs } from "@/lib/apply-preferences";

export function PreferencesApplier({ prefs }: { prefs: AppearancePrefs }) {
  useEffect(() => {
    applyPreferences(prefs);

    // Tema "sistema" acompanha o SO em tempo real
    if (prefs.theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyPreferences(prefs);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
  }, [prefs]);

  return null;
}
