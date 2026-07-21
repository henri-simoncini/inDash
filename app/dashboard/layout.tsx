import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { InterfaceTour } from "@/components/onboarding/interface-tour";
import { PreferencesApplier } from "@/components/settings/preferences-applier";
import type { AppearancePrefs } from "@/lib/apply-preferences";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex min-h-svh">
      <AppSidebar
        userName={profile?.full_name ?? "Sem nome"}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <InterfaceTour show={!tourSeen?.completed} />
      <PreferencesApplier prefs={prefs} />
    </div>
  );
}
