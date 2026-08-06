-- Web Push subscriptions and delivery logs
-- Run manually in Supabase SQL Editor. Do not auto-apply from the app.

-- ---------------------------------------------------------------------------
-- updated_at helper (reuse if already exists)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- public.push_subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text null,
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

create index if not exists push_subscriptions_is_active_idx
  on public.push_subscriptions (is_active);

create index if not exists push_subscriptions_user_id_is_active_idx
  on public.push_subscriptions (user_id, is_active);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_push_subscriptions_updated_at'
  ) then
    create trigger trg_push_subscriptions_updated_at
      before update on public.push_subscriptions
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

alter table public.push_subscriptions enable row level security;

revoke all on table public.push_subscriptions from anon;
revoke all on table public.push_subscriptions from authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
create policy push_subscriptions_select_own
  on public.push_subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
create policy push_subscriptions_insert_own
  on public.push_subscriptions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists push_subscriptions_update_own on public.push_subscriptions;
create policy push_subscriptions_update_own
  on public.push_subscriptions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;
create policy push_subscriptions_delete_own
  on public.push_subscriptions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- public.notification_delivery_logs
-- ---------------------------------------------------------------------------
create table if not exists public.notification_delivery_logs (
  id bigint generated always as identity primary key,
  application_id uuid null references public.expense_applications (id) on delete set null,
  recipient_user_id uuid null references auth.users (id) on delete set null,
  subscription_id uuid null references public.push_subscriptions (id) on delete set null,
  event_type text not null,
  channel text not null default 'web_push',
  status text not null,
  error_code text null,
  error_message text null,
  created_at timestamptz not null default now(),
  constraint notification_delivery_logs_event_type_check
    check (event_type in ('submitted', 'resubmitted', 'approved', 'returned')),
  constraint notification_delivery_logs_channel_check
    check (channel = 'web_push'),
  constraint notification_delivery_logs_status_check
    check (status in ('sent', 'failed', 'skipped', 'expired'))
);

alter table public.notification_delivery_logs enable row level security;

revoke all on table public.notification_delivery_logs from anon;
revoke all on table public.notification_delivery_logs from authenticated;
-- No policies for authenticated/anon: only service role / admin client writes.
