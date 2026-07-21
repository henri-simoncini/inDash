import { createClient } from "@/lib/supabase/server";
import { ProjectsBoard } from "@/components/projects/projects-board";

export const metadata = { title: "Projetos — inDash" };

export default async function ProjetosPage() {
  const supabase = await createClient();

  const [
    { data: projects },
    { data: clients },
    { data: services },
    { data: multipliers },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*, clients(name), services(name), tasks(done)")
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name")
      .eq("archived", false)
      .order("name"),
    supabase
      .from("services")
      .select("id, name, base_price")
      .eq("active", true)
      .order("name"),
    supabase.from("multipliers").select("*").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <ProjectsBoard
        projects={projects ?? []}
        clients={clients ?? []}
        services={services ?? []}
        multipliers={multipliers ?? []}
      />
    </div>
  );
}
