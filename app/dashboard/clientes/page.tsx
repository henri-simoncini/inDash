import { createClient } from "@/lib/supabase/server";
import { ClientsSection } from "@/components/clients/clients-section";

export const metadata = { title: "Clientes — inDash" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; arquivados?: string }>;
}) {
  const { q, arquivados } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("clients").select("*").order("name");

  if (arquivados !== "1") {
    query = query.eq("archived", false);
  }

  const term = q?.replace(/[,()%]/g, " ").trim();
  if (term) {
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data: clients } = await query;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="mt-1 text-muted-foreground">
          Cadastre e acompanhe quem contrata seus serviços.
        </p>
      </div>
      <ClientsSection
        clients={clients ?? []}
        hasQuery={Boolean(term)}
        query={term ?? ""}
      />
    </div>
  );
}
