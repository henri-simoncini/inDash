"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/lib/database.types";
import { addTask, deleteTask, toggleTask } from "@/app/dashboard/projetos/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/60"
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.done}
              onCheckedChange={(checked) => handleToggle(task, checked === true)}
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
            )}
          </li>
        ))}
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
