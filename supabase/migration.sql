-- =============================================
-- I Ching — Supabase Migration
-- Ejecutar en SQL Editor de Supabase Dashboard
-- =============================================

-- Tabla principal de consultas
create table if not exists consultas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  pregunta text not null default '',
  lineas jsonb not null,
  hexagrama_original integer not null,
  nombre_original text not null,
  hexagrama_mutado integer,
  nombre_mutado text,
  tiene_mutaciones boolean default false,
  favorito boolean default false,
  nota text,
  created_at timestamptz default now() not null
);

-- Índices para búsqueda y filtrado
create index if not exists idx_consultas_user on consultas(user_id);
create index if not exists idx_consultas_created on consultas(user_id, created_at desc);
create index if not exists idx_consultas_favorito on consultas(user_id, favorito) where favorito = true;
create index if not exists idx_consultas_hexagrama on consultas(user_id, hexagrama_original);

-- Row Level Security: cada usuario solo ve sus propias consultas
alter table consultas enable row level security;

create policy "Users can view own consultas"
  on consultas for select
  using (auth.uid() = user_id);

create policy "Users can insert own consultas"
  on consultas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own consultas"
  on consultas for update
  using (auth.uid() = user_id);

create policy "Users can delete own consultas"
  on consultas for delete
  using (auth.uid() = user_id);
