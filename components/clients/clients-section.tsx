"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import {
  deleteClientAction,
  setClientArchived,
} from "@/app/dashboard/clientes/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientForm } from "@/components/clients/client-form";
import { ClientSearch } from "@/components/clients/client-search";

type Client = Tables<"clients">;

export function ClientsSection({
  clients,
  hasQuery,
  query,
}: {
  clients: Client[];
  hasQuery: boolean;
  query: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setFormOpen(true);
  }

  function toggleArchive(client: Client) {
    startTransition(async () => {
      const result = await setClientArchived(client.id, !client.archived);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(
          client.archived ? "Cliente restaurado." : "Cliente arquivado."
        );
      }
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const client = deleting;
    startTransition(async () => {
      const result = await deleteClientAction(client.id);
      if (result?.error) {
        if (result.suggestArchive) {
          toast.error(result.error, {
            action: {
              label: "Arquivar",
              onClick: () => toggleArchive({ ...client, archived: false }),
            },
          });
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Cliente excluído.");
      }
      setDeleting(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Seus clientes</CardTitle>
          <CardDescription>
            Quem contrata seus serviços. Clique no nome para ver os detalhes.
          </CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Novo cliente
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <ClientSearch />
        {clients.length === 0 ? (
          hasQuery ? (
            <div className="rounded-lg border border-dashed px-6 py-12 text-center">
              <p className="font-medium">Nenhum resultado para “{query}”</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outro nome ou email — ou confira se o cliente está
                arquivado.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
              <Users className="size-8 text-muted-foreground" aria-hidden />
              <div>
                <p className="font-medium">Nenhum cliente ainda</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cadastre seu primeiro cliente para agendar projetos com ele.
                </p>
              </div>
              <Button onClick={openCreate}>
                <Plus /> Cadastrar cliente
              </Button>
            </div>
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/clientes/${client.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    {client.archived ? (
                      <Badge variant="outline">Arquivado</Badge>
                    ) : (
                      <Badge variant="secondary">Ativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ações do cliente ${client.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(client)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleArchive(client)}>
                          {client.archived ? (
                            <>
                              <ArchiveRestore /> Restaurar
                            </>
                          ) : (
                            <>
                              <Archive /> Arquivar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(client)}
                        >
                          <Trash2 /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ClientForm open={formOpen} onOpenChange={setFormOpen} client={editing} />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Se o cliente tiver projetos, a
              exclusão será bloqueada — nesse caso, prefira arquivar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
