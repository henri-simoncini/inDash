import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClientHeaderActions } from "@/components/clients/client-header-actions";
import { StatusBadge } from "@/components/projects/status-badge";

export const metadata = { title: "Cliente — inDash" };

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, final_price, created_at, services(name)")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/clientes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar para clientes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            {client.archived && <Badge variant="outline">Arquivado</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliente desde{" "}
            {new Date(client.created_at).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <ClientHeaderActions client={client} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden />
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {client.email}
                </a>
              ) : (
                <span className="text-muted-foreground">Sem email</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" aria-hidden />
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="underline-offset-4 hover:underline"
                >
                  {client.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">Sem telefone</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            {client.notes ? (
              <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma nota sobre este cliente ainda. Use o botão Editar para
                adicionar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          {!projects || projects.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
              <FolderKanban
                className="size-8 text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                Nenhum projeto com este cliente ainda. Crie um na aba Projetos.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/projetos/${project.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.services?.name ?? "Serviço removido"} ·{" "}
                        {new Date(project.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatBRL(project.final_price)}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
