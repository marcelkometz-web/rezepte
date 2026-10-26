begin;
-- Retired key locations belong to the old recipe project. No rows are deleted,
-- and the separate current garden project is unaffected.
revoke all on public.garten_settings,public.einstellungen from public,anon,authenticated;
create policy retired_garden_settings_private on public.garten_settings as restrictive for all to anon,authenticated using(false) with check(false);
create policy retired_settings_private on public.einstellungen as restrictive for all to anon,authenticated using(false) with check(false);
-- http is non-relocatable in this project. Remove public execution instead.
do $$ declare f record;begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_depend d on d.objid=p.oid and d.classid='pg_proc'::regclass join pg_extension e on e.oid=d.refobjid where e.extname='http' and d.deptype='e' loop
  execute format('revoke execute on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
commit;
