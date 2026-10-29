-- Snapshot of grammar progress storage; deployed migration: grammar_progress_account_sync.
create table public.grammar_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 profile text not null check (profile in ('Jefferson','Sofia')),
 item_key text not null check (length(item_key) between 1 and 300),
 value jsonb not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,profile,item_key)
);
alter table public.grammar_progress enable row level security;
revoke all on public.grammar_progress from anon;
grant select,insert,update,delete on public.grammar_progress to authenticated;
create policy grammar_select_own on public.grammar_progress for select to authenticated using ((select auth.uid())=user_id);
create policy grammar_insert_own on public.grammar_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy grammar_update_own on public.grammar_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy grammar_delete_own on public.grammar_progress for delete to authenticated using ((select auth.uid())=user_id);

