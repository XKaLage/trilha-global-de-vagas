-- DEMO fixtures only. Everything is rolled back; no users or records remain.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
  BEGIN
    INSERT INTO auth.users(id,raw_app_meta_data) VALUES('00000000-0000-4000-8000-000000000099','{}');
    RAISE EXCEPTION 'TEST FAILED: public registration allowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM NOT LIKE 'Public registration disabled:%' THEN RAISE; END IF;
  END;
END $$;
INSERT INTO auth.users(id,raw_app_meta_data) VALUES
('00000000-0000-4000-8000-000000000001','{"foundation_provisioned":true}'),
('00000000-0000-4000-8000-000000000002','{"foundation_provisioned":true}');
DO $$ BEGIN
  IF (SELECT count(*) FROM public.candidate_profiles WHERE owner_id IN ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'))<>2 THEN RAISE EXCEPTION 'TEST FAILED: account provisioning'; END IF;
  IF EXISTS(SELECT 1 FROM public.user_roles WHERE role='admin') THEN RAISE EXCEPTION 'TEST FAILED: auto admin'; END IF;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated","user_metadata":{"role":"admin"}}',true);
DO $$ DECLARE v_job uuid; v_application uuid; v_candidate uuid; v_rule uuid; BEGIN
  IF (SELECT count(*) FROM public.candidate_profiles)<>1 THEN RAISE EXCEPTION 'TEST FAILED: cross-user visibility'; END IF;
  IF public.foundation_admin() THEN RAISE EXCEPTION 'TEST FAILED: user metadata admin'; END IF;
  UPDATE public.candidate_profiles SET display_name='DEMO UNAUTHORIZED' WHERE owner_id='00000000-0000-4000-8000-000000000002';
  IF FOUND THEN RAISE EXCEPTION 'TEST FAILED: cross-user update'; END IF;
  BEGIN
    INSERT INTO public.user_roles(user_id,role) VALUES(auth.uid(),'admin');
    RAISE EXCEPTION 'TEST FAILED: role escalation';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  SELECT id INTO v_candidate FROM public.candidate_profiles;
  BEGIN
    INSERT INTO public.candidate_experiences(candidate_id,owner_id,title) VALUES(v_candidate,'00000000-0000-4000-8000-000000000002','DEMO');
    RAISE EXCEPTION 'TEST FAILED: forged owner';
  EXCEPTION WHEN insufficient_privilege OR foreign_key_violation THEN NULL; END;
  v_job:=public.foundation_save_job('{"title":"DEMO Cook","employer":"DEMO Company","dedup_key":"example.com/demo","fingerprint":"demo|cook|demo","owner_id":"00000000-0000-4000-8000-000000000002"}');
  IF (SELECT owner_id FROM public.jobs WHERE id=v_job)<>auth.uid() THEN RAISE EXCEPTION 'TEST FAILED: trusted client owner'; END IF;
  BEGIN
    PERFORM public.foundation_save_job('{"title":"DEMO Cook","employer":"DEMO Company","dedup_key":"example.com/demo","fingerprint":"different"}');
    RAISE EXCEPTION 'TEST FAILED: duplicate URL';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    PERFORM public.foundation_save_job('{"title":"DEMO Cook","employer":"DEMO Company","dedup_key":"example.com/other","fingerprint":"demo|cook|demo"}');
    RAISE EXCEPTION 'TEST FAILED: duplicate fingerprint';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  v_rule:=public.foundation_save_rules('{}','DEMO');
  BEGIN
    PERFORM public.foundation_record_evaluation(v_job,v_rule,'compatible',100,'[]','["internationalOk"]');
    RAISE EXCEPTION 'TEST FAILED: missing blockers compatible';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'Missing blockers cannot be compatible' THEN RAISE; END IF;
  END;
  v_application:=public.foundation_select_job(v_job);
  BEGIN
    PERFORM public.foundation_authorize_application(v_application,false,'DEMO');
    RAISE EXCEPTION 'TEST FAILED: authorization without consent';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'Explicit authorization required' THEN RAISE; END IF;
  END;
  PERFORM public.foundation_authorize_application(v_application,true,'DEMO explicit authorization');
  IF NOT EXISTS(SELECT 1 FROM public.applications WHERE id=v_application AND status='authorized' AND authorized_by=auth.uid()) THEN RAISE EXCEPTION 'TEST FAILED: author identity'; END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
  BEGIN
    UPDATE public.applications SET status='submitted',submitted_at=now() WHERE owner_id='00000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'TEST FAILED: external submission allowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'External application actions remain disabled' THEN RAISE; END IF;
  END;
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated","app_metadata":{"role":"admin"}}',true);
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.jobs) OR EXISTS(SELECT 1 FROM public.applications) OR EXISTS(SELECT 1 FROM public.rule_sets) OR EXISTS(SELECT 1 FROM public.audit_events) THEN RAISE EXCEPTION 'TEST FAILED: private records leak'; END IF;
  IF public.foundation_admin() THEN RAISE EXCEPTION 'TEST FAILED: admin claim without protected role'; END IF;
  BEGIN
    PERFORM public.foundation_select_job((SELECT id FROM public.jobs LIMIT 1));
    RAISE EXCEPTION 'TEST FAILED: foreign selection';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM<>'Unauthorized' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN
    PERFORM 1 FROM public.candidate_profiles;
    RAISE EXCEPTION 'TEST FAILED: anonymous rows';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.foundation_save_job('{}');
    RAISE EXCEPTION 'TEST FAILED: anonymous mutation';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF (public.foundation_health()->>'schema')<>'true' THEN RAISE EXCEPTION 'TEST FAILED: safe health unavailable'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: provisioning, closed signup, owner isolation, role safety, dedup, missing information, authorization, external-action block and anonymous denial; DEMO fixtures rolled back' AS result;