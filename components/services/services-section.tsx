"use client";

import { useState, useTransition } from "react";
import { Briefcase, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { formatBRL } from "@/lib/format";
import { deleteService } from "@/app/dashboard/servicos/actions";
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
import { ServiceForm } from "@/components/services/service-form";

type Service = Tables<"services">;

export function ServicesSection({ services }: { services: Service[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteService(deleting.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Serviço excluído.");
      }
      setDeleting(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Seus serviços</CardTitle>
          <CardDescription>
            O que você oferece, com o preço base de cada um.
          </CardDescription>
        </div>
        {services.length > 0 && (
          <Button onClick={openCreate}>
            <Plus /> Novo serviço
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
            <Briefcase className="size-8 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-medium">Nenhum serviço ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre seu primeiro serviço — ele é a base para criar projetos
                e precificar seu trabalho.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus /> Cadastrar serviço
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Preço base</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="mt-0.5 max-w-md truncate text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatBRL(service.base_price)}
                  </TableCell>
                  <TableCell>
                    {service.active ? (
                      <Badge>Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ações do serviço ${service.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(service)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(service)}
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

      <ServiceForm open={formOpen} onOpenChange={setFormOpen} service={editing} />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir “{deleting?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os fatores multiplicativos vinculados a este serviço também serão
              excluídos. Essa ação não pode ser desfeita.
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
