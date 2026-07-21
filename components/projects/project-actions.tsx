"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CircleCheckBig,
  MoreHorizontal,
  Pencil,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Enums, Tables } from "@/lib/database.types";
import {
  deleteProject,
  updateProjectStatus,
} from "@/app/dashboard/projetos/actions";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectForm } from "@/components/projects/project-form";

type Project = Tables<"projects">;
type Client = Pick<Tables<"clients">, "id" | "name">;
type Service = Pick<Tables<"services">, "id" | "name" | "base_price">;

export function ProjectActions({
  project,
  clients,
  services,
  snapshotProduct,
}: {
  project: Project;
  clients: Client[];
  services: Service[];
  snapshotProduct: number;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function changeStatus(status: Enums<"project_status">, message: string) {
    startTransition(async () => {
      const result = await updateProjectStatus(project.id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(message);
      }
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result?.error) {
        toast.error(result.error);
        setConfirmingDelete(false);
      } else {
        toast.success("Projeto excluído.");
        router.push("/dashboard/projetos");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {project.status === "agendado" && (
        <Button
          onClick={() => changeStatus("em_andamento", "Projeto iniciado!")}
          disabled={isPending}
        >
          <Play /> Iniciar projeto
        </Button>
      )}
      {project.status === "em_andamento" && (
        <Button
          onClick={() => changeStatus("finalizado", "Projeto finalizado! 🎉")}
          disabled={isPending}
        >
          <CircleCheckBig /> Finalizar
        </Button>
      )}
      {(project.status === "finalizado" || project.status === "cancelado") && (
        <Button
          variant="outline"
          onClick={() => changeStatus("em_andamento", "Projeto reaberto.")}
          disabled={isPending}
        >
          <RotateCcw /> Reabrir
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Mais ações">
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFormOpen(true)}>
            <Pencil /> Editar
          </DropdownMenuItem>
          {(project.status === "agendado" ||
            project.status === "em_andamento") && (
            <DropdownMenuItem
              onClick={() => changeStatus("cancelado", "Projeto cancelado.")}
            >
              <Ban /> Cancelar projeto
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clients={clients}
        services={services}
        multipliers={[]}
        project={project}
        snapshotProduct={snapshotProduct}
      />

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{project.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              As tarefas e os pagamentos registrados neste projeto serão
              excluídos junto. Essa ação não pode ser desfeita.
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
    </div>
  );
}
