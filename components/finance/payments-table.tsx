"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CircleCheckBig, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { formatBRL } from "@/lib/format";
import {
  deletePayment,
  markPaymentPaid,
} from "@/app/dashboard/financeiro/actions";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type PaymentListItem = Tables<"payments"> & {
  projects:
    | (Pick<Tables<"projects">, "id" | "title"> & {
        clients: Pick<Tables<"clients">, "name"> | null;
      })
    | null;
};

export function PaymentsTable({ payments }: { payments: PaymentListItem[] }) {
  const [deleting, setDeleting] = useState<PaymentListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleMarkPaid(payment: PaymentListItem) {
    startTransition(async () => {
      const result = await markPaymentPaid(
        payment.id,
        payment.project_id
      );
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pagamento confirmado. 💰");
      }
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const payment = deleting;
    startTransition(async () => {
      const result = await deletePayment(payment.id, payment.project_id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pagamento excluído.");
      }
      setDeleting(null);
    });
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Projeto</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-20">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.projects ? (
                  <Link
                    href={`/dashboard/projetos/${payment.projects.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {payment.projects.title}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    Projeto removido
                  </span>
                )}
                {payment.projects?.clients && (
                  <p className="text-xs text-muted-foreground">
                    {payment.projects.clients.name}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatBRL(payment.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.method ?? "—"}
              </TableCell>
              <TableCell>
                {payment.status === "pago" ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Pago
                  </Badge>
                ) : (
                  <Badge variant="outline">Pendente</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.paid_at
                  ? new Date(payment.paid_at).toLocaleDateString("pt-BR")
                  : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {payment.status === "pendente" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleMarkPaid(payment)}
                      disabled={isPending}
                      aria-label="Marcar como pago"
                      title="Marcar como pago"
                    >
                      <CircleCheckBig className="size-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setDeleting(payment)}
                    disabled={isPending}
                    aria-label="Excluir pagamento"
                    title="Excluir pagamento"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir pagamento de {deleting && formatBRL(deleting.amount)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O valor sai das estatísticas. Essa ação não pode ser desfeita.
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
    </>
  );
}
