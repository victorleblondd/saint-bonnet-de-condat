-- Saint-Bonnet-de-Condat — abonnements aux notifications du site.
-- À coller dans Supabase : SQL Editor > New query > Run. On peut le relancer : les abonnements sont conservés.
-- Le site n'a accès qu'aux deux fonctions abonner / desabonner (clé publique).
-- La liste des abonnés ne se lit qu'avec la clé secrète (envoi depuis GitHub).

create table if not exists public.abonnements (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  cree_le timestamptz not null default now(),
  constraint service_de_notification check (
    length(endpoint) < 1000
    and endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com|[a-z0-9.-]+\.notify\.windows\.com)/'
  ),
  constraint cles_valides check (length(p256dh) between 80 and 100 and length(auth) between 16 and 30)
);

alter table public.abonnements enable row level security;
revoke all on table public.abonnements from anon, authenticated, service_role;
-- L'envoi depuis GitHub (clé secrète) lit la liste et retire les abonnements expirés.
-- Droit donné explicitement : les nouveaux projets Supabase n'en donnent plus par défaut.
grant select, delete on table public.abonnements to service_role;

create or replace function public.abonner(p_endpoint text, p_p256dh text, p_auth text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.abonnements (endpoint, p256dh, auth)
  values (p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
$$;

create or replace function public.desabonner(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.abonnements where endpoint = p_endpoint;
$$;

-- Seule la clé publique (rôle anon) appelle ces deux fonctions : ce sont les seules entrées du site.
-- Le conseiller de sécurité de Supabase les signale (« Public Can Execute SECURITY DEFINER Function ») : c'est voulu.
revoke all on function public.abonner(text, text, text) from public, authenticated;
revoke all on function public.desabonner(text) from public, authenticated;
grant execute on function public.abonner(text, text, text) to anon;
grant execute on function public.desabonner(text) to anon;
