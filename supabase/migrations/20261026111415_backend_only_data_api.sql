begin;
-- This project uses the authenticated Edge gateway, never browser-side SQL/RPC.
-- Managed http functions are owned by supabase_admin and cannot be individually
-- revoked by postgres. Deny browser roles the namespace instead, retaining
-- normal platform operation and privileged API access.
revoke all on schema public from public,anon,authenticated;
grant usage on schema public to service_role,authenticator,supabase_auth_admin,supabase_storage_admin;
do $$ begin
 if has_schema_privilege('anon','public','USAGE') or has_schema_privilege('authenticated','public','USAGE') then raise exception 'Client schema access was not revoked';end if;
 if not has_schema_privilege('service_role','public','USAGE') or not has_schema_privilege('authenticator','public','USAGE') then raise exception 'Backend schema access missing';end if;
end $$;
notify pgrst,'reload schema';
commit;
