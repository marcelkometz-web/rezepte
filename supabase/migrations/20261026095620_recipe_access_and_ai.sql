-- Recipe project only. Shared identity and family access are verified by the
-- recipes-api Edge Function against the existing garden Auth and RLS APIs.
begin;
create schema if not exists recipes_private;
revoke all on schema recipes_private from public,anon,authenticated;
grant usage on schema recipes_private to service_role;
create table recipes_private.rights(user_id uuid primary key,can_edit boolean not null default false);
alter table recipes_private.rights enable row level security;
revoke all on recipes_private.rights from public,anon,authenticated;
grant all on recipes_private.rights to service_role;
create function public.recipe_rights() returns table(user_id uuid,can_edit boolean)
language sql stable security definer set search_path='' as $$ select r.user_id,r.can_edit from recipes_private.rights r $$;
create function public.recipe_set_right(target_user uuid,edit_allowed boolean) returns void
language sql security definer set search_path='' as $$ insert into recipes_private.rights values(target_user,edit_allowed) on conflict(user_id) do update set can_edit=excluded.can_edit $$;
revoke all on function public.recipe_rights(),public.recipe_set_right(uuid,boolean) from public,anon,authenticated;
grant execute on function public.recipe_rights(),public.recipe_set_right(uuid,boolean) to service_role;
create table recipes_private.variations(name text primary key,payload jsonb not null);
alter table recipes_private.variations enable row level security;
revoke all on recipes_private.variations from public,anon,authenticated;
grant all on recipes_private.variations to service_role;
create function public.recipe_variations() returns jsonb language sql stable security definer set search_path='' as $$ select coalesce(jsonb_object_agg(name,payload),'{}'::jsonb) from recipes_private.variations $$;
revoke all on function public.recipe_variations() from public,anon,authenticated;
grant execute on function public.recipe_variations() to service_role;
-- No browser role may query or change these records directly. The API gate
-- verifies a current, confirmed garden user, central capabilities and family.
do $$ declare p record; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('Rezepte','Notizen') loop
  execute format('drop policy %I on public.%I',p.policyname,p.tablename);
 end loop;
end $$;
revoke all on public."Rezepte",public."Notizen" from public,anon,authenticated;
grant select,insert,update,delete on public."Rezepte",public."Notizen" to service_role;
alter table public."Rezepte" enable row level security;
alter table public."Notizen" enable row level security;
alter table public."Rezepte" add column revision bigint not null default 1;
alter table public."Rezepte" add column updated_at timestamptz not null default now();
create function recipes_private.bump_revision() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.revision:=old.revision+1;new.updated_at:=now();return new;end $$;
revoke all on function recipes_private.bump_revision() from public,anon,authenticated;
create trigger recipe_revision before update on public."Rezepte" for each row execute function recipes_private.bump_revision();
revoke all on function public.generiere_rezept_ki(text) from public,anon,authenticated;
alter function public.generiere_rezept_ki(text) set search_path = public,extensions;
-- A restrictive guard keeps even old permissive storage policies from opening
-- the recipe bucket. Other buckets retain their existing behavior.
update storage.buckets set public=false,file_size_limit=1048576,allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='RezeptBilder';
create policy recipe_image_gateway_only on storage.objects as restrictive for all to public
 using (bucket_id<>'RezeptBilder') with check (bucket_id<>'RezeptBilder');
create function public.recipe_restore(backup jsonb) returns integer
language plpgsql security invoker set search_path='' as $$
declare item jsonb;r public."Rezepte";seq text:=pg_get_serial_sequence('public."Rezepte"','id');largest bigint;amount integer:=0;begin
 if jsonb_typeof(backup)<>'array' or jsonb_array_length(backup) not between 1 and 1000 then raise exception 'Invalid backup';end if;
 lock table public."Rezepte" in access exclusive mode;
 select greatest(coalesce(max(id),1),coalesce((select max((v->>'id')::bigint) from jsonb_array_elements(backup) v),1)) into largest from public."Rezepte";
 perform setval(seq,greatest(largest,nextval(seq)),true);
 for item in select value from jsonb_array_elements(backup) loop
  select * into r from jsonb_populate_record(null::public."Rezepte",item);
  insert into public."Rezepte"(id, created_at, "recipes", "title", "ingredients", "prep", "description", "category", "calories", "image", "emoji", "airfryer", "kcal", "prot", "kh", "fat", "stove_step", "airfryer_step", "oven_step", "doc_check", "zutaten_liste", "tipps", "sugar", "sat_fat", "fiber", "salt", "has_side", "score", "image_url") values(coalesce(r.id,nextval(seq)), coalesce(r.created_at,now()), r."recipes", r."title", r."ingredients", r."prep", r."description", r."category", r."calories", r."image", r."emoji", r."airfryer", r."kcal", r."prot", r."kh", r."fat", r."stove_step", r."airfryer_step", r."oven_step", r."doc_check", r."zutaten_liste", r."tipps", r."sugar", r."sat_fat", r."fiber", r."salt", r."has_side", r."score", r."image_url")
  on conflict(id) do update set created_at=excluded.created_at, "recipes"=excluded."recipes", "title"=excluded."title", "ingredients"=excluded."ingredients", "prep"=excluded."prep", "description"=excluded."description", "category"=excluded."category", "calories"=excluded."calories", "image"=excluded."image", "emoji"=excluded."emoji", "airfryer"=excluded."airfryer", "kcal"=excluded."kcal", "prot"=excluded."prot", "kh"=excluded."kh", "fat"=excluded."fat", "stove_step"=excluded."stove_step", "airfryer_step"=excluded."airfryer_step", "oven_step"=excluded."oven_step", "doc_check"=excluded."doc_check", "zutaten_liste"=excluded."zutaten_liste", "tipps"=excluded."tipps", "sugar"=excluded."sugar", "sat_fat"=excluded."sat_fat", "fiber"=excluded."fiber", "salt"=excluded."salt", "has_side"=excluded."has_side", "score"=excluded."score", "image_url"=excluded."image_url";
  amount:=amount+1;
 end loop;return amount;
end $$;
revoke all on function public.recipe_restore(jsonb) from public,anon,authenticated;
grant execute on function public.recipe_restore(jsonb) to service_role;
commit;
