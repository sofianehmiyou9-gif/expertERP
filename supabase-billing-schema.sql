-- ExpertERP - Billing schema (Stripe-ready)
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  entreprise_email text not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_status_idx on public.billing_subscriptions(status);
create index if not exists billing_subscriptions_period_end_idx on public.billing_subscriptions(current_period_end);

create table if not exists public.billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  stripe_event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists billing_webhook_events_type_idx on public.billing_webhook_events(stripe_event_type);

-- Generic updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_billing_subscriptions_updated_at on public.billing_subscriptions;
create trigger trg_billing_subscriptions_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();

-- RLS
alter table public.billing_subscriptions enable row level security;
alter table public.billing_webhook_events enable row level security;

-- Allow authenticated users to read only their own subscription by email claim.
drop policy if exists billing_subscriptions_select_own on public.billing_subscriptions;
create policy billing_subscriptions_select_own
on public.billing_subscriptions
for select
to authenticated
using (lower(entreprise_email) = lower(coalesce(auth.jwt()->>'email', '')));

-- No direct client-side write access.
drop policy if exists billing_subscriptions_write_none on public.billing_subscriptions;
create policy billing_subscriptions_write_none
on public.billing_subscriptions
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists billing_webhook_events_read_none on public.billing_webhook_events;
create policy billing_webhook_events_read_none
on public.billing_webhook_events
for all
to anon, authenticated
using (false)
with check (false);

-- Helper used by frontend/edge-function checks.
create or replace function public.is_subscription_active(p_email text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.billing_subscriptions b
    where lower(b.entreprise_email) = lower(coalesce(p_email, ''))
      and b.status in ('trialing', 'active')
      and (b.current_period_end is null or b.current_period_end >= now())
  );
$$;
