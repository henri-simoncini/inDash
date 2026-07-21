"use client";

import { useState, useTransition } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { formatFactor } from "@/lib/format";
import { deleteMultiplier } from "@/app/dashboard/servicos/actions";
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
import {
  KIND_LABELS,
  MultiplierForm,
} from "@/components/services/multiplier-form";

type Multiplier = Tables<"multipliers">;
type Service = Tables<"services">;

export function MultipliersSection({
  multipliers,
  services,
}: {
  multipliers: Multiplier[];
  services: Service[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Multiplier | null>(null);
  const [deleting, setDeleting] = useState<Multiplier | null>(null);
  const [isPending, startTransition] = useTransition();

  const serviceNames = new Map(services.map((s) => [s.id, s.name]));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(multiplier: Multiplier) {
    setEditing(multiplier);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteMultiplier(deleting.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Fator excluído.");
      }
      setDeleting(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Fatores multiplicativos</CardTitle>
          <CardDescription>
            Ajustes de preço que você aplica ao criar um projeto, como urgência
            ou complexidade.
          </CardDescription>
        </div>
        {multipliers.length > 0 && (
          <Button onClick={openCreate}>
            <Plus /> Novo fator
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {multipliers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
            <SlidersHorizontal
              className="size-8 text-muted-foreground"
              aria-hidden
            />
            <div>
              <p className="font-medium">Nenhum fator ainda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crie fatores como “Urgente ×1,5” para ajustar o preço dos
                projetos sem refazer contas.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus /> Criar fator
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fator</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Multiplica por</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {multipliers.map((multiplier) => (
                <TableRow key={multiplier.id}>
                  <TableCell className="font-medium">
                    {multiplier.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {KIND_LABELS[multiplier.kind]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatFactor(multiplier.factor)}
                  </TableCell>
                  <TableCell>
                    {multiplier.service_id ? (
                      <span className="text-sm">
                        {serviceNames.get(multiplier.service_id) ??
                          "Serviço excluído"}
                      </span>
                    ) : (
                      <Badge variant="outline">Global</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Ações do fator ${multiplier.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(multiplier)}>
                          <Pencil /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(multiplier)}
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

      <MultiplierForm
        open={formOpen}
        onOpenChange={setFormOpen}
        multiplier={editing}
        services={services}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Projetos que já usam este fator mantêm o preço calculado. Essa
              ação não pode ser desfeita.
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
