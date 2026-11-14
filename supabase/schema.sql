-- شاهين ديزاين: شغّل هذا الملف مرة وحدة في Supabase ← SQL Editor

-- تخزين المحتوى والمحادثات والطلبات (مفتاح ← قيمة)
create table if not exists public.kv (
  key        text primary key,
  value      text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists kv_expires_idx on public.kv (expires_at);

-- مقفل: ما يقرأه ولا يكتب فيه إلا الخادم بالمفتاح السري
alter table public.kv enable row level security;
revoke all on public.kv from anon, authenticated;
grant all on public.kv to service_role;

-- حاوية الصور: عامة للقراءة (عشان تظهر في الموقع)، والرفع من الخادم فقط
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152,
        array['image/png','image/jpeg','image/webp','image/svg+xml','image/gif'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
