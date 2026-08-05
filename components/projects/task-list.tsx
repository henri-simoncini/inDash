"use client";

import { useState, useTransition } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import {
  addTask,
  deleteTask,
  toggleTask,
  updateTaskNotes,
} from "@/app/dashboard/projetos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Task = Tables<"tasks">;

export function TaskList({
  projectId,
  tasks,
  readOnly,
}: {
  projectId: string;
  tasks: Task[];
  readOnly: boolean;
}) {
  const [title, setTitle] = useState("");
  // Uma observação aberta por vez: evita vários rascunhos soltos na tela
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    startTransition(async () => {
      const result = await addTask(projectId, value);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setTitle("");
      }
    });
  }

  function handleToggle(task: Task, checked: boolean) {
    startTransition(async () => {
      const result = await toggleTask(task.id, projectId, checked);
      if (result?.error) toast.error(result.error);
    });
  }

  function handleDelete(task: Task) {
    startTransition(async () => {
      const result = await deleteTask(task.id, projectId);
      if (result?.error) toast.error(result.error);
    });
  }

  function openNotes(task: Task) {
    setEditingId(task.id);
    setDraft(task.notes ?? "");
  }

  function handleSaveNotes(task: Task) {
    startTransition(async () => {
      const result = await updateTaskNotes(task.id, projectId, draft);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setEditingId(null);
        setDraft("");
      }
    });
  }

  return (
    <div className="space-y-4">
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {done} de {total} concluída{total === 1 ? "" : "s"}
            </span>
            <span className="font-medium tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} aria-label="Progresso das tarefas" />
        </div>
      )}

      {total === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {readOnly
            ? "Este projeto não tem tarefas."
            : "Quebre o projeto em tarefas e acompanhe o progresso até a entrega."}
        </p>
      )}

      <ul className="space-y-1">
        {tasks.map((task) => {
          const isEditing = editingId === task.id;
          return (
            <li
              key={task.id}
              className="group rounded-md px-2 py-1.5 hover:bg-muted/60"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.done}
                  onCheckedChange={(checked) =>
                    handleToggle(task, checked === true)
                  }
                  disabled={readOnly || isPending}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "flex-1 text-sm",
                    task.done && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </label>
                {!readOnly && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      // Quem já tem observação mostra o botão sempre — é a
                      // pista de que existe texto ali dentro
                      className={cn(
                        "size-7 transition-opacity",
                        task.notes
                          ? "text-primary"
                          : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      )}
                      onClick={() =>
                        isEditing ? setEditingId(null) : openNotes(task)
                      }
                      aria-expanded={isEditing}
                      aria-label={
                        task.notes
                          ? `Editar observação da tarefa ${task.title}`
                          : `Adicionar observação à tarefa ${task.title}`
                      }
                    >
                      <NotebookPen className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => handleDelete(task)}
                      disabled={isPending}
                      aria-label={`Excluir tarefa ${task.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </>
                )}
              </div>

              {isEditing ? (
                <div className="mt-2 space-y-2 pl-8">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Detalhe a tarefa: o que precisa ser feito, links, combinados com o cliente..."
                    aria-label={`Observação da tarefa ${task.title}`}
                    rows={3}
                    autoFocus
                    disabled={isPending}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveNotes(task)}
                      disabled={isPending}
                    >
                      {isPending ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                task.notes && (
                  <p className="mt-1 whitespace-pre-wrap pl-8 text-xs text-muted-foreground">
                    {task.notes}
                  </p>
                )
              )}
            </li>
          );
        })}
      </ul>

      {!readOnly && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nova tarefa..."
            aria-label="Nova tarefa"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending || !title.trim()}>
            <Plus /> Adicionar
          </Button>
        </form>
      )}
    </div>
  );
}
