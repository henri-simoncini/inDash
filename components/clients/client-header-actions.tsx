"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { setClientArchived } from "@/app/dashboard/clientes/actions";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";

type Client = Tables<"clients">;

export function ClientHeaderActions({ client }: { client: Client }) {
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleArchive() {
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

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={toggleArchive}
        disabled={isPending}
      >
        {client.archived ? (
          <>
            <ArchiveRestore /> Restaurar
          </>
        ) : (
          <>
            <Archive /> Arquivar
          </>
        )}
      </Button>
      <Button onClick={() => setFormOpen(true)}>
        <Pencil /> Editar
      </Button>
      <ClientForm open={formOpen} onOpenChange={setFormOpen} client={client} />
    </div>
  );
}
