-- Observação livre por tarefa da TO-DO list, para detalhar o que precisa ser
-- feito. Coluna nova em tabela existente, então herda o RLS de tasks — as
-- policies são por linha e já cobrem qualquer coluna.

alter table public.tasks
  add column if not exists notes text;
