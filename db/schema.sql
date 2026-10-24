create table if not exists public.users (
    id text primary key,
    name text not null,
    email text unique not null,
    salt text not null,
    password_hash text not null,
    created_at timestamptz not null default now(),
    cart_items jsonb not null default '[]'::jsonb
);

alter table public.users
    add column if not exists cart_items jsonb not null default '[]'::jsonb;

alter table public.users
    add column if not exists role text not null default 'customer'
    check (role in ('customer', 'admin'));

create table if not exists public.products (
    id text primary key,
    name text not null,
    description text not null default '',
    category text not null,
    price integer not null check (price > 0),
    available boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
    id uuid primary key default gen_random_uuid(),
    user_id text references public.users(id) on delete set null,
    name text not null,
    last_name text not null,
    phone text not null,
    email text not null,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id text not null references public.users(id) on delete cascade,
    items jsonb not null,
    total integer not null check (total >= 0),
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx
    on public.orders (user_id, created_at desc);
