import type { PreferencesValues } from "@/lib/validations/preferences";

export type AppearancePrefs = Omit<PreferencesValues, "emailNotifications">;

// Aplica as preferências no <html> — mesmo efeito do script anti-flash
export function applyPreferences(prefs: AppearancePrefs) {
  const html = document.documentElement;
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  html.classList.toggle("dark", dark);

  if (prefs.fontSize === "md") {
    html.removeAttribute("data-font-size");
  } else {
    html.setAttribute("data-font-size", prefs.fontSize);
  }

  if (prefs.fontFamily === "sans") {
    html.removeAttribute("data-font");
  } else {
    html.setAttribute("data-font", prefs.fontFamily);
  }

  if (prefs.highContrast) {
    html.setAttribute("data-contrast", "high");
  } else {
    html.removeAttribute("data-contrast");
  }
}
