-- Snapshot da estrutura usada no projeto Supabase. Não contém credenciais.
create table if not exists public.study_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 scope text not null check(scope in ('jefferson_dialogues','sofia_dialogues','jefferson_materials','sofia_materials')),
 item_id text not null,
 value jsonb not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,scope,item_id)
);
alter table public.study_progress enable row level security;
revoke all on public.study_progress from anon;
grant select,insert,update,delete on public.study_progress to authenticated;
create policy own_progress_select on public.study_progress for select to authenticated using ((select auth.uid())=user_id);
create policy own_progress_insert on public.study_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_progress_update on public.study_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_progress_delete on public.study_progress for delete to authenticated using ((select auth.uid())=user_id);
