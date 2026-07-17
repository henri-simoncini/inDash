-- inDash — schema inicial
-- Todas as tabelas: id uuid pk, user_id -> auth.users, created_at, updated_at, RLS por usuário.

-- ============================================================
-- Enums
-- ============================================================
create type public.project_status as enum ('agendado', 'em_andamento', 'finalizado', 'cancelado');
create type public.payment_status as enum ('pendente', 'pago');
create type public.multiplier_kind as enum ('complexity', 'deadline', 'custom');
create type public.theme_pref as enum ('light', 'dark', 'system');
create type public.font_size_pref as enum ('sm', 'md', 'lg');

-- ============================================================
-- Função genérica de updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tabelas
-- ============================================================

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  tour_seen jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  theme public.theme_pref not null default 'system',
  font_size public.font_size_pref not null default 'md',
  font_family text not null default 'sans',
  high_contrast boolean not null default false,
  email_notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.multipliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind public.multiplier_kind not null default 'custom',
  factor numeric(8,4) not null check (factor > 0),
  -- null = multiplicador global (vale para qualquer serviço)
  service_id uuid references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- restrict: impede deletar cliente/serviço com projetos (regra de negócio 4)
  client_id uuid not null references public.clients (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  title text not null,
  status public.project_status not null default 'agendado',
  base_price numeric(12,2) not null check (base_price >= 0),
  final_price numeric(12,2) not null check (final_price >= 0),
  scheduled_at timestamptz,
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_multipliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  -- set null: o snapshot do fator sobrevive se o multiplicador for deletado
  multiplier_id uuid references public.multipliers (id) on delete set null,
  factor_snapshot numeric(8,4) not null check (factor_snapshot > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status public.payment_status not null default 'pendente',
  paid_at timestamptz,
  method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Índices
-- ============================================================
create index idx_services_user on public.services (user_id);
create index idx_multipliers_user on public.multipliers (user_id);
create index idx_multipliers_service on public.multipliers (service_id);
create index idx_clients_user on public.clients (user_id);
create index idx_projects_user on public.projects (user_id);
create index idx_projects_client on public.projects (client_id);
create index idx_projects_service on public.projects (service_id);
create index idx_project_multipliers_user on public.project_multipliers (user_id);
create index idx_project_multipliers_project on public.project_multipliers (project_id);
create index idx_tasks_user on public.tasks (user_id);
create index idx_tasks_project on public.tasks (project_id);
create index idx_payments_user on public.payments (user_id);
create index idx_payments_project on public.payments (project_id);
create index idx_payments_paid_at on public.payments (paid_at);

-- ============================================================
-- Triggers de updated_at
-- ============================================================
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.preferences
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.multipliers
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.project_multipliers
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- Novo usuário: cria profile + preferences automaticamente
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  insert into public.preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- RLS: usuário só enxerga as próprias linhas
-- ============================================================
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.services enable row level security;
alter table public.multipliers enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_multipliers enable row level security;
alter table public.tasks enable row level security;
alter table public.payments enable row level security;

create policy "select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.profiles for delete using (auth.uid() = user_id);

create policy "select_own" on public.preferences for select using (auth.uid() = user_id);
create policy "insert_own" on public.preferences for insert with check (auth.uid() = user_id);
create policy "update_own" on public.preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.preferences for delete using (auth.uid() = user_id);

create policy "select_own" on public.services for select using (auth.uid() = user_id);
create policy "insert_own" on public.services for insert with check (auth.uid() = user_id);
create policy "update_own" on public.services for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.services for delete using (auth.uid() = user_id);

create policy "select_own" on public.multipliers for select using (auth.uid() = user_id);
create policy "insert_own" on public.multipliers for insert with check (auth.uid() = user_id);
create policy "update_own" on public.multipliers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.multipliers for delete using (auth.uid() = user_id);

create policy "select_own" on public.clients for select using (auth.uid() = user_id);
create policy "insert_own" on public.clients for insert with check (auth.uid() = user_id);
create policy "update_own" on public.clients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.clients for delete using (auth.uid() = user_id);

create policy "select_own" on public.projects for select using (auth.uid() = user_id);
create policy "insert_own" on public.projects for insert with check (auth.uid() = user_id);
create policy "update_own" on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.projects for delete using (auth.uid() = user_id);

create policy "select_own" on public.project_multipliers for select using (auth.uid() = user_id);
create policy "insert_own" on public.project_multipliers for insert with check (auth.uid() = user_id);
create policy "update_own" on public.project_multipliers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.project_multipliers for delete using (auth.uid() = user_id);

create policy "select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "update_own" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.tasks for delete using (auth.uid() = user_id);

create policy "select_own" on public.payments for select using (auth.uid() = user_id);
create policy "insert_own" on public.payments for insert with check (auth.uid() = user_id);
create policy "update_own" on public.payments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own" on public.payments for delete using (auth.uid() = user_id);
