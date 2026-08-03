import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { InterfaceTour } from "@/components/onboarding/interface-tour";
import { PreferencesApplier } from "@/components/settings/preferences-applier";
import type { AppearancePrefs } from "@/lib/apply-preferences";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Deploy sem as variáveis do Supabase: manda para o login, que explica
  // a situação, em vez de estourar erro ao criar o client.
  if (!isSupabaseConfigured) {
    redirect("/sign-in");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, tour_seen")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("preferences")
      .select("theme, font_size, font_family, high_contrast")
      .eq("user_id", user.id)
      .single(),
  ]);

  const tourSeen = profile?.tour_seen as { completed?: boolean } | null;

  const prefs: AppearancePrefs = {
    theme: preferences?.theme ?? "system",
    fontSize: preferences?.font_size ?? "md",
    fontFamily: ["sans", "serif", "mono"].includes(
      preferences?.font_family ?? ""
    )
      ? (preferences!.font_family as AppearancePrefs["fontFamily"])
      : "sans",
    highContrast: preferences?.high_contrast ?? false,
  };

  const userName = profile?.full_name ?? "Sem nome";
  const userEmail = user.email ?? "";

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Pular para o conteúdo
      </a>
      <AppSidebar userName={userName} userEmail={userEmail} />
      <MobileHeader userName={userName} userEmail={userEmail} />
      {/* A sidebar é fixa, então o conteúdo precisa reservar a largura dela */}
      <main
        id="conteudo"
        className="flex-1 p-4 md:ml-60 md:p-6"
      >
        {children}
      </main>
      <InterfaceTour show={!tourSeen?.completed} />
      <PreferencesApplier prefs={prefs} />
    </div>
  );
}
