-- Run only after backup-restore-additive.sql has been reviewed/applied.
-- Synthetic collection rows and private receipts are rolled back together.
begin;
set local role service_role;
do $$
declare
 actor uuid:=gen_random_uuid();family uuid:=gen_random_uuid();operation uuid:=gen_random_uuid();
 suffix text:=gen_random_uuid()::text;existing_id bigint;existing_note bigint;source_base bigint;
 baseline_recipes bigint;baseline_notes bigint;expected text;recipes jsonb;notes jsonb;first_result jsonb;again jsonb;zero_result jsonb;
 first_path text:='recipes/'||gen_random_uuid()::text||'.jpg';retry_path text:='recipes/'||gen_random_uuid()::text||'.jpg';claimed text[];new_id bigint;conflict boolean:=false;
begin
 if has_function_privilege('anon','public.recipe_restore_additive(uuid,uuid,uuid,uuid,uuid,text,jsonb,jsonb)','execute') or has_function_privilege('authenticated','public.recipe_restore_additive(uuid,uuid,uuid,uuid,uuid,text,jsonb,jsonb)','execute') then raise exception 'Restore RPC exposed to browser roles';end if;
 insert into public."Rezepte"(title,kcal) values('QA Existing '||suffix,100) returning id into existing_id;
 insert into public."Notizen"(content,author,is_done) values('QA Existing note '||suffix,'QA',false) returning id into existing_note;
 select count(*) into baseline_recipes from public."Rezepte";
 select count(*) into baseline_notes from public."Notizen";
 select greatest(coalesce(max(id),0),existing_note)+1000000 into source_base from public."Notizen";
 perform public.recipe_backup_upload_register(actor,family,operation,first_path,'image/jpeg',repeat('a',64));
 recipes:=jsonb_build_array(jsonb_build_object('source_id',source_base,'title','  QA Existing '||suffix||'  ','kcal',999),jsonb_build_object('source_id',source_base+1,'title','QA New '||suffix,'kcal',111,'prot',22,'image_url',first_path));
 notes:=jsonb_build_array(jsonb_build_object('source_id',existing_note,'content','QA Existing note '||suffix,'author','QA','is_done',false),jsonb_build_object('source_id',source_base,'content','QA Repeated shopping note '||suffix,'author','QA','is_done',false),jsonb_build_object('source_id',source_base+1,'content','QA Repeated shopping note '||suffix,'author','QA','is_done',false));
 expected:=public.recipe_backup_snapshot();
 first_result:=public.recipe_restore_additive(actor,family,actor,family,operation,expected,recipes,notes);
 if first_result->'counts'<>jsonb_build_object('recipes',1,'notes',2) or(first_result->'recipeMap'->>source_base::text)::bigint<>existing_id then raise exception 'Incorrect additive counts/map: %',first_result;end if;
 if(select kcal from public."Rezepte" where id=existing_id)<>100 then raise exception 'Existing recipe was overwritten';end if;
 if(select count(*) from public."Rezepte")<>baseline_recipes+1 or(select count(*) from public."Notizen")<>baseline_notes+2 then raise exception 'Incorrect inserted row counts';end if;
 new_id:=(first_result->'recipeMap'->>(source_base+1)::text)::bigint;
 if not exists(select 1 from public."Rezepte" where id=new_id and title='QA New '||suffix and image_url=first_path) then raise exception 'Recipe map did not preserve new image';end if;
 again:=public.recipe_restore_additive(actor,family,actor,family,operation,expected,recipes,notes);
 if again<>first_result then raise exception 'Stable retry did not return receipt';end if;
 -- A new upload of the SAME image bytes is a semantically identical retry.
 perform public.recipe_backup_upload_register(actor,family,operation,retry_path,'image/jpeg',repeat('a',64));
 recipes:=jsonb_set(recipes,'{1,image_url}',to_jsonb(retry_path));
 again:=public.recipe_restore_additive(actor,family,actor,family,operation,expected,recipes,notes);
 if again<>first_result then raise exception 'Image retry path broke idempotency';end if;
 select array_agg(c.path) into claimed from public.recipe_backup_upload_claim_cleanup(actor,family,operation,array[first_path,retry_path]) c;
 if claimed is distinct from array[retry_path] then raise exception 'Cleanup claimed referenced image or missed unused retry';end if;
 begin
  update public."Rezepte" set image_url=retry_path where id=new_id;
 exception when serialization_failure then conflict:=true;
 end;
 if not conflict then raise exception 'Recipe write could reference a cleanup-claimed image';end if;
 perform public.recipe_backup_upload_finish_cleanup(actor,family,operation,array[retry_path]);
 conflict:=false;
 begin
  perform public.recipe_restore_additive(actor,family,actor,family,gen_random_uuid(),expected,recipes,notes);
 exception when serialization_failure then conflict:=true;
 end;
 if not conflict then raise exception 'Stale collection snapshot accepted';end if;
 zero_result:=public.recipe_restore_additive(actor,family,actor,family,gen_random_uuid(),public.recipe_backup_snapshot(),recipes,notes);
 if zero_result->'counts'<>jsonb_build_object('recipes',0,'notes',0) then raise exception 'Repeated archive created duplicates';end if;
 if(select count(*) from public."Rezepte")<>baseline_recipes+1 or(select count(*) from public."Notizen")<>baseline_notes+2 then raise exception 'Retry changed legitimate multiplicity';end if;
 raise notice 'PASS additive recipe/note restore, provenance, receipt retry, image SHA mapping, stale snapshot and cleanup race guard';
end $$;
rollback;
