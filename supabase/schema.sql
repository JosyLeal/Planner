-- Cole este arquivo no SQL Editor do Supabase quando for conectar.
-- Tabela de atividades do dia (aba Dia / Semana).

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  mes text,
  data date not null,
  dia text,
  inicio time not null,
  fim time not null,
  duracao text,
  concluido boolean not null default false,
  atividade text not null,
  detalhes text default '',
  created_at timestamptz not null default now()
);

create index if not exists activities_user_data_idx
  on public.activities (user_id, data);

alter table public.activities enable row level security;

create policy "Usuário vê só as próprias atividades"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "Usuário cria as próprias atividades"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza as próprias atividades"
  on public.activities for update
  using (auth.uid() = user_id);

create policy "Usuário apaga as próprias atividades"
  on public.activities for delete
  using (auth.uid() = user_id);

-- Rotina semanal planejada (aba Resumo).

create table if not exists public.routine (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  atividade text not null,
  icon text,
  cor text,
  domingo text default '',
  segunda text default '',
  terca text default '',
  quarta text default '',
  quinta text default '',
  sexta text default '',
  sabado text default '',
  created_at timestamptz not null default now(),
  unique (user_id, atividade)
);

alter table public.routine enable row level security;

create policy "Usuário vê só a própria rotina"
  on public.routine for select
  using (auth.uid() = user_id);

create policy "Usuário cria a própria rotina"
  on public.routine for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza a própria rotina"
  on public.routine for update
  using (auth.uid() = user_id);

create policy "Usuário apaga a própria rotina"
  on public.routine for delete
  using (auth.uid() = user_id);
