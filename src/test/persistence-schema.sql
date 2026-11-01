-- Read-only schema assertions; no account creation or data mutations.
\set ON_ERROR_STOP on
DO $$ DECLARE v_table text; BEGIN
  FOREACH v_table IN ARRAY ARRAY['profiles','user_roles','candidate_profiles','candidate_experiences','candidate_education','candidate_certifications','candidate_documents','job_sources','jobs','job_evaluations','rule_sets','applications','employer_messages','audit_events'] LOOP
    IF NOT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=v_table AND rowsecurity) THEN RAISE EXCEPTION 'Missing table or RLS: %',v_table; END IF;
    IF has_table_privilege('anon','public.'||v_table,'SELECT') OR has_table_privilege('anon','public.'||v_table,'INSERT') THEN RAISE EXCEPTION 'Anonymous privilege: %',v_table; END IF;
  END LOOP;
  IF has_table_privilege('authenticated','public.user_roles','INSERT') OR has_table_privilege('authenticated','public.user_roles','UPDATE') THEN RAISE EXCEPTION 'Role escalation privilege'; END IF;
  IF has_table_privilege('authenticated','public.applications','INSERT') OR has_table_privilege('authenticated','public.applications','UPDATE') THEN RAISE EXCEPTION 'Direct authorization mutation'; END IF;
  IF has_table_privilege('authenticated','public.employer_messages','INSERT') THEN RAISE EXCEPTION 'Gmail write enabled'; END IF;
  IF has_table_privilege('authenticated','public.candidate_documents','INSERT') THEN RAISE EXCEPTION 'Document upload metadata enabled'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='one_active_rule_set' AND indexdef LIKE '%UNIQUE%') THEN RAISE EXCEPTION 'Active rule uniqueness missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.jobs'::regclass AND contype='u' AND pg_get_constraintdef(oid)='UNIQUE (owner_id, dedup_key)') THEN RAISE EXCEPTION 'URL dedup missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.jobs'::regclass AND contype='u' AND pg_get_constraintdef(oid)='UNIQUE (owner_id, fingerprint)') THEN RAISE EXCEPTION 'Fingerprint dedup missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.applications'::regclass AND conname='application_authorization_evidence') THEN RAISE EXCEPTION 'Authorization evidence missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.job_evaluations'::regclass AND conname='evaluations_missing_not_compatible') THEN RAISE EXCEPTION 'Missing-data classification constraint missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='foundation_registration_closed' AND tgenabled='O') THEN RAISE EXCEPTION 'Signup barrier missing'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='applications_external_disabled' AND tgenabled='O') THEN RAISE EXCEPTION 'Submission barrier missing'; END IF;
END $$;
SELECT 'PASS: 14 RLS tables, anonymous denial, role protection, write restrictions, dedup constraints, rule uniqueness, authorization evidence, missing-data constraint, registration/submission barriers' AS result;