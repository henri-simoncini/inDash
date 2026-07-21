"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { clientSchema, type ClientValues } from "@/lib/validations/client";
import {
  createClientAction,
  updateClientAction,
} from "@/app/dashboard/clientes/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Client = Tables<"clients">;

export function ClientForm({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", phone: "", notes: "" },
  });

  useEffect(() => {
    if (open) {
      setServerError(undefined);
      reset({
        name: client?.name ?? "",
        email: client?.email ?? "",
        phone: client?.phone ?? "",
        notes: client?.notes ?? "",
      });
    }
  }, [open, client, reset]);

  function onSubmit(values: ClientValues) {
    setServerError(undefined);
    startTransition(async () => {
      const result = client
        ? await updateClientAction(client.id, values)
        : await createClientAction(values);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success(client ? "Cliente atualizado." : "Cliente cadastrado.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Atualize os dados de contato do cliente."
              : "Cadastre um cliente para agendar projetos com ele."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client-name">Nome</Label>
            <Input
              id="client-name"
              placeholder="Ex.: Maria da Padaria Estrela"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="client-email">
                Email{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="cliente@exemplo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-phone">
                Telefone{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="client-phone"
                type="tel"
                placeholder="(11) 99999-9999"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-notes">
              Notas{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="client-notes"
              rows={3}
              placeholder="Preferências, contexto, como chegou até você..."
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : client
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
