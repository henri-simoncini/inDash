import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { InterfaceTour } from "@/components/onboarding/interface-tour";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, tour_seen")
    .eq("user_id", user.id)
    .single();

  const tourSeen = profile?.tour_seen as { completed?: boolean } | null;

  return (
    <div className="flex min-h-svh">
      <AppSidebar
        userName={profile?.full_name ?? "Sem nome"}
        userEmail={user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
      <InterfaceTour show={!tourSeen?.completed} />
    </div>
  );
}
