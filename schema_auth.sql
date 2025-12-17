-- Create Users table (extends auth.users)
create table if not exists public.usuarios (
  id uuid references auth.users(id) on delete cascade primary key,
  empresa_id uuid references public.empresas(id),
  email text unique not null,
  role text not null default 'user',
  two_factor_enabled boolean not null default false,
  two_factor_secret text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  last_login_at timestamp with time zone
);

-- RLS
alter table public.usuarios enable row level security;

create policy "Users can view their own profile" 
  on public.usuarios for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.usuarios for update 
  using (auth.uid() = id);

-- Trigger to create public.usuarios record on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.usuarios (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
