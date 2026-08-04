import { createClient } from "@/lib/supabase/server";
import type { PreferencesValues } from "@/lib/validations/preferences";
import { AccountSettings } from "@/components/settings/account-settings";
import { OnboardingSettings } from "@/components/settings/onboarding-settings";
import { PreferencesSettings } from "@/components/settings/preferences-settings";
import { PixSettings } from "@/components/settings/pix-settings";
import { readPixProfile } from "@/lib/pix-profile";
import type { PixSettingsValues } from "@/lib/validations/pix";

export const metadata = { title: "Configurações — inDash" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: preferences },
    { data: profile },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("preferences").select("*").single(),
    supabase.from("profiles").select("*").single(),
  ]);

  const pix = readPixProfile(profile);
  const pixInitial: PixSettingsValues | null = pix
    ? { keyType: pix.keyType, key: pix.key, name: pix.name, city: pix.city }
    : null;

  const fontFamily = ["sans", "serif", "mono"].includes(
    preferences?.font_family ?? ""
  )
    ? (preferences!.font_family as PreferencesValues["fontFamily"])
    : "sans";

  const initial: PreferencesValues = {
    theme: preferences?.theme ?? "system",
    fontSize: preferences?.font_size ?? "md",
    fontFamily,
    highContrast: preferences?.high_contrast ?? false,
    emailNotifications: preferences?.email_notifications ?? true,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Deixe o inDash com a sua cara.
        </p>
      </div>

      <PreferencesSettings initial={initial} />
      <PixSettings initial={pixInitial} />
      <OnboardingSettings />
      <AccountSettings
        fullName={profile?.full_name ?? ""}
        email={user?.email ?? ""}
      />
    </div>
  );
}
