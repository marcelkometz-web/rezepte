-- The managed HTTP extension is owned by supabase_admin. Its per-routine ACLs
-- are not the browser boundary: this project denies public-schema USAGE to
-- both browser roles and serves data through the authenticated Edge gateway.
begin;
do $test$
begin
 if has_schema_privilege('anon','public','usage') or has_schema_privilege('authenticated','public','usage') then
  raise exception 'Browser role can enter backend-only namespace';
 end if;
 if not has_schema_privilege('service_role','public','usage') then raise exception 'Backend namespace unavailable';end if;
 execute 'set local role anon';
 begin
  perform 1 from public."Rezepte" limit 1;
  raise exception 'Anonymous recipe read reached backend namespace';
 exception when insufficient_privilege then null;end;
 execute 'reset role';
 execute 'set local role authenticated';
 begin
  perform 1 from public."Rezepte" limit 1;
  raise exception 'Browser SQL bypassed the Edge gateway';
 exception when insufficient_privilege then null;end;
 execute 'reset role';
end $test$;
rollback;
select 'PASS: direct browser namespace access is denied; the backend service retains its namespace. Managed public HTTP placement does not make its routines callable by browser roles.' as verification;
