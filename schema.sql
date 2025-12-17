-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2.1 Empresas
create table if not exists public.empresas (
  id uuid primary key default uuid_generate_v4(),
  razao_social text not null,
  nome_fantasia text,
  cnpj text not null
);

-- 2.2 Locais de Trabalho
create table if not exists public.locais_trabalho (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  nome_local text not null
);

-- 2.3 Setores
create table if not exists public.setores (
  id uuid primary key default uuid_generate_v4(),
  local_trabalho_id uuid references public.locais_trabalho(id) on delete cascade not null,
  nome_setor text not null,
  descricao_ambiente text
);

-- 2.4 Cargos
create table if not exists public.cargos (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  nome_cargo text not null,
  cbo text
);

-- 2.5 GHE
create table if not exists public.ghe (
  id uuid primary key default uuid_generate_v4(),
  local_trabalho_id uuid references public.locais_trabalho(id) on delete cascade not null,
  nome_ghe text not null,
  codigo_ghe text
);

-- 2.6 GHE Cargos
create table if not exists public.ghe_cargos (
  id uuid primary key default uuid_generate_v4(),
  ghe_id uuid references public.ghe(id) on delete cascade not null,
  cargo_id uuid references public.cargos(id) on delete cascade not null
);

-- 2.7 Catalogo Exames
create table if not exists public.catalogo_exames (
  id uuid primary key default uuid_generate_v4(),
  nome_exame text not null,
  cod_esocial text
);

-- 2.8 Catalogo Riscos
create table if not exists public.catalogo_riscos (
  id uuid primary key default uuid_generate_v4(),
  categoria text not null,
  nome_agente text not null,
  cod_esocial text
);

-- 2.9 Documentos SST
create table if not exists public.documentos_sst (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  tipo_documento text not null,
  data_base date not null,
  data_validade date,
  responsavel_tecnico text,
  versao text default '1.0'
);

-- 2.10 PCMSO Protocolos
create table if not exists public.pcmso_protocolos (
  id uuid primary key default uuid_generate_v4(),
  ghe_id uuid references public.ghe(id) on delete cascade not null,
  exame_id uuid references public.catalogo_exames(id) on delete cascade not null,
  periodicidade_meses integer,
  tipo_exame text
);

-- 2.11 Funcionarios
create table if not exists public.funcionarios (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade not null,
  cargo_id uuid references public.cargos(id) on delete cascade not null,
  ghe_id uuid references public.ghe(id) on delete cascade not null,
  nome_completo text not null,
  cpf varchar(11) unique not null,
  data_nascimento date not null,
  data_admissao date not null,
  created_at timestamp default now() not null
);

-- 2.12 Exames Realizados
create table if not exists public.exames_realizados (
  id uuid primary key default uuid_generate_v4(),
  funcionario_id uuid references public.funcionarios(id) on delete cascade not null,
  exame_id uuid references public.catalogo_exames(id) on delete cascade not null,
  data_realizacao date not null,
  data_vencimento date,
  resultado text,
  medico_responsavel text,
  crm_medico text
);

-- 2.13 Plano de Acao
create table if not exists public.plano_acao (
  id uuid primary key default uuid_generate_v4(),
  documento_id uuid references public.documentos_sst(id) on delete cascade,
  inventario_risco_id uuid, -- Link futuro
  descricao_acao text not null,
  responsavel text,
  data_inicio date,
  data_fim_prevista date,
  status text default 'PENDENTE'
);

-- Enable Row Level Security (RLS) basics (Optional but recommended, defaulting to open for MVP if no auth rules yet)
alter table public.empresas enable row level security;
alter table public.locais_trabalho enable row level security;
alter table public.setores enable row level security;
alter table public.cargos enable row level security;
alter table public.ghe enable row level security;
alter table public.ghe_cargos enable row level security;
alter table public.catalogo_exames enable row level security;
alter table public.catalogo_riscos enable row level security;
alter table public.documentos_sst enable row level security;
alter table public.pcmso_protocolos enable row level security;
alter table public.funcionarios enable row level security;
alter table public.exames_realizados enable row level security;
alter table public.plano_acao enable row level security;

-- Policies (Permissive for MVP development, assuming authenticated users can do everything)
create policy "Enable all for authenticated users" on public.empresas for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.locais_trabalho for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.setores for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.cargos for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.ghe for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.ghe_cargos for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.catalogo_exames for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.catalogo_riscos for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.documentos_sst for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.pcmso_protocolos for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.funcionarios for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.exames_realizados for all using (true) with check (true);
create policy "Enable all for authenticated users" on public.plano_acao for all using (true) with check (true);
