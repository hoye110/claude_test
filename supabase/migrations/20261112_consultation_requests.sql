-- Leads submitted from the "Nhận tư vấn lộ trình học miễn phí" form on the homepage.
create table if not exists public.consultation_requests (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  phone       text not null check (phone ~ '^[0-9+ .]{9,20}$'),
  email       text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  track       text not null check (char_length(track) <= 80),
  message     text check (message is null or char_length(message) <= 2000),
  source_page text check (source_page is null or char_length(source_page) <= 300),
  status      text not null default 'new' check (status in ('new', 'contacted', 'enrolled', 'closed'))
);

comment on table public.consultation_requests is 'Yêu cầu tư vấn từ form trên trang chủ MCI';

-- Row Level Security: visitors (anon key) may only INSERT new rows.
-- They can never read, update or delete — staff view leads in the Supabase dashboard
-- or with the service_role key, which bypasses RLS.
alter table public.consultation_requests enable row level security;

drop policy if exists "Anyone can submit a consultation request" on public.consultation_requests;
create policy "Anyone can submit a consultation request"
  on public.consultation_requests
  for insert
  to anon, authenticated
  with check (status = 'new');

-- Column-level grant: the public may only fill these fields (not id/created_at/status).
revoke all on public.consultation_requests from anon, authenticated;
grant insert (full_name, phone, email, track, message, source_page)
  on public.consultation_requests to anon, authenticated;

create index if not exists consultation_requests_created_at_idx
  on public.consultation_requests (created_at desc);
