-- Run this in your Supabase SQL Editor to set up the database

-- Asset sets table (each row = one set of images for an app)
create table if not exists asset_sets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  app_name text not null default '',
  name_en text not null default '',
  subtitle text not null default '',
  icon_url text not null default '',
  store_url text not null default '',
  asset_type text[] not null default '{}',
  platform text not null default 'App Store',
  region text not null default 'US',
  category text not null default 'Other',
  tags text[] not null default '{}',
  images text[] not null default '{}'
);

-- Enable RLS but allow public access (anyone with the link)
alter table asset_sets enable row level security;

create policy "Anyone can view asset_sets"
  on asset_sets for select using (true);

create policy "Anyone can insert asset_sets"
  on asset_sets for insert with check (true);

create policy "Anyone can delete asset_sets"
  on asset_sets for delete using (true);

create policy "Anyone can update asset_sets"
  on asset_sets for update using (true);
