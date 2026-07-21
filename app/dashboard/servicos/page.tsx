import { createClient } from "@/lib/supabase/server";
import { ServicesSection } from "@/components/services/services-section";
import { MultipliersSection } from "@/components/services/multipliers-section";

export const metadata = { title: "Serviços — inDash" };

export default async function ServicosPage() {
  const supabase = await createClient();

  const [{ data: services }, { data: multipliers }] = await Promise.all([
    supabase.from("services").select("*").order("name"),
    supabase
      .from("multipliers")
      .select("*")
      .order("service_id", { ascending: true, nullsFirst: true })
      .order("name"),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Serviços</h1>
        <p className="mt-1 text-muted-foreground">
          Cadastre o que você oferece e os fatores que ajustam o preço de cada
          projeto.
        </p>
      </div>
      <ServicesSection services={services ?? []} />
      <MultipliersSection
        multipliers={multipliers ?? []}
        services={services ?? []}
      />
    </div>
  );
}
