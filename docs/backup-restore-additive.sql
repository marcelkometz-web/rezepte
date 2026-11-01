-- Recipe project only. Review/apply via the owning deployment workflow.
-- The Edge gateway authenticates the Garden actor, current session, family,
-- ab_current_diary approval and owner role before invoking these service-only RPCs.
begin;
create table if not exists recipes_private.backup_uploads(
 path text primary key,
 actor uuid not null,
 family uuid not null,
 operation_id uuid not null,
 mime text not null check(mime in ('image/jpeg','image/png','image/webp')),
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 state text not null default 'active' check(state in ('active','committed','cleanup','deleted')),
 created_at timestamptz not null default now()
);
create index if not exists backup_uploads_operation on recipes_private.backup_uploads(actor,family,operation_id);
create table if not exists recipes_private.restored_note_origins(
 source_actor uuid not null,
 source_family uuid not null,
 source_note_id bigint not null check(source_note_id>0),
 target_note_id bigint not null references public."Notizen"(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(source_actor,source_family,source_note_id)
);
create index if not exists restored_note_origins_target on recipes_private.restored_note_origins(target_note_id);
create table if not exists recipes_private.restore_receipts(
 operation_id uuid primary key,
 actor uuid not null,
 family uuid not null,
 payload_hash text not null,
 result jsonb not null,
 created_at timestamptz not null default now()
);
alter table recipes_private.backup_uploads enable row level security;
alter table recipes_private.restored_note_origins enable row level security;
alter table recipes_private.restore_receipts enable row level security;
revoke all on recipes_private.backup_uploads,recipes_private.restored_note_origins,recipes_private.restore_receipts from public,anon,authenticated;
grant select,insert,update,delete on recipes_private.backup_uploads,recipes_private.restored_note_origins,recipes_private.restore_receipts to service_role;

create or replace function recipes_private.title_key(value text) returns text
language sql immutable security invoker set search_path='' as $$
 select lower(regexp_replace(btrim(coalesce(value,'')),'[[:space:]]+',' ','g'))
$$;
revoke all on function recipes_private.title_key(text) from public,anon,authenticated;
grant execute on function recipes_private.title_key(text) to service_role;

create or replace function public.recipe_backup_snapshot() returns text
language sql stable security invoker set search_path='' as $$
 select md5(jsonb_build_object(
  'recipes',(select coalesce(jsonb_agg(jsonb_build_array(r.id,r.revision) order by r.id),'[]'::jsonb) from public."Rezepte" r),
  'notes',(select coalesce(jsonb_agg(jsonb_build_array(n.id,n.content,n.author,n.is_done) order by n.id),'[]'::jsonb) from public."Notizen" n where btrim(n.author) not ilike 'SYSTEM%')
 )::text)
$$;
revoke all on function public.recipe_backup_snapshot() from public,anon,authenticated;
grant execute on function public.recipe_backup_snapshot() to service_role;

create or replace function public.recipe_backup_upload_register(p_actor uuid,p_family uuid,p_operation uuid,p_path text,p_mime text,p_sha256 text) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if p_actor is null or p_family is null or p_operation is null or p_path !~ '^recipes/[0-9a-f-]{36}\.(jpg|png|webp)$' or p_sha256 !~ '^[a-f0-9]{64}$' then raise exception 'Invalid upload';end if;
 insert into recipes_private.backup_uploads(path,actor,family,operation_id,mime,sha256) values(p_path,p_actor,p_family,p_operation,p_mime,p_sha256);
end $$;
revoke all on function public.recipe_backup_upload_register(uuid,uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.recipe_backup_upload_register(uuid,uuid,uuid,text,text,text) to service_role;

-- A cleanup claim is a database state change, not just an advisory read. A
-- subsequent recipe write cannot reference an object after its cleanup claim.
create or replace function recipes_private.guard_backup_image_reference() returns trigger
language plpgsql security invoker set search_path='' as $$
declare upload_state text;
begin
 if new.image_url is null then return new;end if;
 select u.state into upload_state from recipes_private.backup_uploads u where u.path=new.image_url for update;
 if found and upload_state in ('cleanup','deleted') then raise exception 'Backup image is being cleaned up' using errcode='40001';end if;
 return new;
end $$;
revoke all on function recipes_private.guard_backup_image_reference() from public,anon,authenticated;
grant execute on function recipes_private.guard_backup_image_reference() to service_role;
drop trigger if exists recipe_backup_image_reference on public."Rezepte";
create trigger recipe_backup_image_reference before insert or update of image_url on public."Rezepte" for each row execute function recipes_private.guard_backup_image_reference();

create or replace function public.recipe_backup_upload_claim_cleanup(p_actor uuid,p_family uuid,p_operation uuid,p_paths text[] default null) returns table(path text)
language plpgsql security invoker set search_path='' as $$
begin
 if p_actor is null or p_family is null or p_operation is null or coalesce(cardinality(p_paths),0)>100 then raise exception 'Invalid cleanup';end if;
 return query
 with selected as (
  select u.path from recipes_private.backup_uploads u
  where u.actor=p_actor and u.family=p_family and u.operation_id=p_operation and u.state in ('active','cleanup')
   and(p_paths is null or u.path=any(p_paths))
   and not exists(select 1 from public."Rezepte" r where r.image_url=u.path)
  order by u.created_at,u.path limit 100 for update of u skip locked
 ),claimed as (
  update recipes_private.backup_uploads u set state='cleanup' from selected s where u.path=s.path returning u.path
 ) select c.path from claimed c;
end $$;
revoke all on function public.recipe_backup_upload_claim_cleanup(uuid,uuid,uuid,text[]) from public,anon,authenticated;
grant execute on function public.recipe_backup_upload_claim_cleanup(uuid,uuid,uuid,text[]) to service_role;

create or replace function public.recipe_backup_upload_finish_cleanup(p_actor uuid,p_family uuid,p_operation uuid,p_paths text[]) returns integer
language plpgsql security invoker set search_path='' as $$
declare changed integer;
begin
 if p_actor is null or p_family is null or p_operation is null or cardinality(p_paths)>100 then raise exception 'Invalid cleanup';end if;
 update recipes_private.backup_uploads u set state='deleted' where u.actor=p_actor and u.family=p_family and u.operation_id=p_operation and u.state='cleanup' and u.path=any(p_paths) and not exists(select 1 from public."Rezepte" r where r.image_url=u.path);
 get diagnostics changed=row_count;return changed;
end $$;
revoke all on function public.recipe_backup_upload_finish_cleanup(uuid,uuid,uuid,text[]) from public,anon,authenticated;
grant execute on function public.recipe_backup_upload_finish_cleanup(uuid,uuid,uuid,text[]) to service_role;

create or replace function public.recipe_restore_additive(p_actor uuid,p_family uuid,p_source_actor uuid,p_source_family uuid,p_operation uuid,p_expected_snapshot text,p_recipes jsonb,p_notes jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 item jsonb;recipe public."Rezepte";target bigint;source bigint;recorded recipes_private.restore_receipts;
 amount_recipes integer:=0;amount_notes integer:=0;skipped_recipes integer:=0;skipped_notes integer:=0;
 recipe_map jsonb:='{}'::jsonb;fingerprint_recipes jsonb;result jsonb;fingerprint text;image_state text;image_actor uuid;image_family uuid;image_operation uuid;
begin
 if p_actor is null or p_family is null or p_operation is null or p_source_actor is distinct from p_actor or p_source_family is distinct from p_family or p_expected_snapshot !~ '^[a-f0-9]{32}$' or jsonb_typeof(p_recipes) is distinct from 'array' or jsonb_typeof(p_notes) is distinct from 'array' then raise exception 'Invalid restore';end if;
 if jsonb_array_length(p_recipes)>1000 or jsonb_array_length(p_notes)>10000 then raise exception 'Restore too large';end if;
 -- A temporary upload path can change on a retried upload. Bind receipts to
 -- the actual immutable image bytes, so the same archive remains idempotent.
 select coalesce(jsonb_agg(case when u.sha256 is not null then jsonb_set(v.item,'{image_url}',to_jsonb('sha256:'||u.sha256)) else v.item end order by v.ordinality),'[]'::jsonb) into fingerprint_recipes
 from jsonb_array_elements(p_recipes) with ordinality v(item,ordinality)
 left join recipes_private.backup_uploads u on u.path=v.item->>'image_url' and u.actor=p_actor and u.family=p_family and u.operation_id=p_operation;
 fingerprint:=md5(jsonb_build_object('actor',p_actor,'family',p_family,'sourceActor',p_source_actor,'sourceFamily',p_source_family,'expectedSnapshot',p_expected_snapshot,'recipes',fingerprint_recipes,'notes',p_notes)::text);
 -- Serializes all collection changes and makes the snapshot and provenance
 -- comparison part of the same transaction as every inserted recipe/note.
 lock table public."Rezepte",public."Notizen" in share row exclusive mode;
 select * into recorded from recipes_private.restore_receipts r where r.operation_id=p_operation;
 if found then
  if recorded.actor is distinct from p_actor or recorded.family is distinct from p_family or recorded.payload_hash<>fingerprint then raise exception 'Restore operation changed' using errcode='40001';end if;
  if exists(select 1 from jsonb_each_text(recorded.result->'recipeMap') m where not exists(select 1 from public."Rezepte" r where r.id=m.value::bigint)) or exists(select 1 from jsonb_array_elements(p_notes) n where not exists(select 1 from recipes_private.restored_note_origins o where o.source_actor=p_source_actor and o.source_family=p_source_family and o.source_note_id=(n->>'source_id')::bigint)) then raise exception 'Restored records were subsequently removed' using errcode='40001';end if;
  return recorded.result;
 end if;
 if public.recipe_backup_snapshot() is distinct from p_expected_snapshot then raise exception 'Collection changed' using errcode='40001';end if;
 if exists(select 1 from jsonb_array_elements(p_recipes) v group by v->>'source_id' having count(*)>1) or exists(select 1 from jsonb_array_elements(p_recipes) v group by recipes_private.title_key(v->>'title') having count(*)>1) or exists(select 1 from jsonb_array_elements(p_notes) v group by v->>'source_id' having count(*)>1) then raise exception 'Duplicate archive identifiers';end if;
 for item in select value from jsonb_array_elements(p_recipes) loop
  source:=(item->>'source_id')::bigint;if source is null or source<1 or nullif(recipes_private.title_key(item->>'title'),'') is null then raise exception 'Invalid source recipe';end if;
  select r.id into target from public."Rezepte" r where recipes_private.title_key(r.title)=recipes_private.title_key(item->>'title') order by r.id limit 1;
  if found then skipped_recipes:=skipped_recipes+1;
  else
   select * into recipe from jsonb_populate_record(null::public."Rezepte",item);
   if recipe.image_url is not null and recipe.image_url<>'' then
    select u.state,u.actor,u.family,u.operation_id into image_state,image_actor,image_family,image_operation from recipes_private.backup_uploads u where u.path=recipe.image_url for update;
    if not found or image_state<>'active' or image_actor is distinct from p_actor or image_family is distinct from p_family or image_operation is distinct from p_operation then raise exception 'Image upload not registered for this restore';end if;
   end if;
   insert into public."Rezepte"(created_at,recipes,title,ingredients,prep,description,category,calories,image,emoji,airfryer,kcal,prot,kh,fat,stove_step,airfryer_step,oven_step,doc_check,zutaten_liste,tipps,sugar,sat_fat,fiber,salt,has_side,score,image_url)
   values(coalesce(recipe.created_at,now()),recipe.recipes,recipe.title,recipe.ingredients,recipe.prep,recipe.description,recipe.category,recipe.calories,recipe.image,recipe.emoji,recipe.airfryer,recipe.kcal,recipe.prot,recipe.kh,recipe.fat,recipe.stove_step,recipe.airfryer_step,recipe.oven_step,recipe.doc_check,recipe.zutaten_liste,recipe.tipps,recipe.sugar,recipe.sat_fat,recipe.fiber,recipe.salt,recipe.has_side,recipe.score,recipe.image_url) returning id into target;
   if recipe.image_url is not null and recipe.image_url<>'' then update recipes_private.backup_uploads u set state='committed' where u.path=recipe.image_url;end if;
   amount_recipes:=amount_recipes+1;
  end if;
  recipe_map:=recipe_map||jsonb_build_object(source::text,target);
 end loop;
 for item in select value from jsonb_array_elements(p_notes) loop
  source:=(item->>'source_id')::bigint;
  if source is null or source<1 or jsonb_typeof(item->'content') is distinct from 'string' or nullif(btrim(item->>'content'),'') is null or length(item->>'content')>30000 or jsonb_typeof(item->'author') is distinct from 'string' or nullif(btrim(item->>'author'),'') is null or length(item->>'author')>80 or btrim(item->>'author') ilike 'SYSTEM%' or jsonb_typeof(item->'is_done') is distinct from 'boolean' then raise exception 'Invalid note';end if;
  select o.target_note_id into target from recipes_private.restored_note_origins o where o.source_actor=p_source_actor and o.source_family=p_source_family and o.source_note_id=source;
  if found then skipped_notes:=skipped_notes+1;continue;end if;
  select n.id into target from public."Notizen" n where n.id=source and n.content is not distinct from(item->>'content') and n.author is not distinct from(item->>'author') and n.is_done is not distinct from(item->>'is_done')::boolean;
  if found then skipped_notes:=skipped_notes+1;
  else insert into public."Notizen"(content,author,is_done) values(item->>'content',item->>'author',(item->>'is_done')::boolean) returning id into target;amount_notes:=amount_notes+1;
  end if;
  insert into recipes_private.restored_note_origins(source_actor,source_family,source_note_id,target_note_id) values(p_source_actor,p_source_family,source,target);
 end loop;
 result:=jsonb_build_object('ok',true,'counts',jsonb_build_object('recipes',amount_recipes,'notes',amount_notes),'skipped',jsonb_build_object('recipes',skipped_recipes,'notes',skipped_notes),'recipeMap',recipe_map,'snapshot',public.recipe_backup_snapshot());
 insert into recipes_private.restore_receipts(operation_id,actor,family,payload_hash,result) values(p_operation,p_actor,p_family,fingerprint,result);
 return result;
end $$;
revoke all on function public.recipe_restore_additive(uuid,uuid,uuid,uuid,uuid,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.recipe_restore_additive(uuid,uuid,uuid,uuid,uuid,text,jsonb,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
