-- ============================================
-- Migration v15: Security Hardening — RLS Enforcement
-- Date: 2026-02-28
-- ============================================
-- This migration addresses the following vulnerabilities:
--   1. contact_submissions table has NO RLS (PII exposed to anon)
--   2. Ensures RLS + authenticated-only policies on all back-office tables
--   3. Ensures tours table allows public SELECT but blocks anon writes
--   4. Documents OpenAPI/Swagger disabling (must be done in Supabase Dashboard)
--
-- HOW TO APPLY:
--   Run this entire script in the Supabase SQL Editor.
--   All statements are idempotent (safe to re-run).
-- ============================================


-- ============================================
-- SECTION 1: contact_submissions — CREATE + RLS
-- ============================================
-- This table was created manually and has NO Row Level Security.
-- Anyone with the anon key can SELECT all records (names, emails, phones).

CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tour_interest TEXT,
  travel_date TEXT,
  pax INT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS (idempotent — no-op if already enabled)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies (cleanup)
DROP POLICY IF EXISTS "anon_insert_contact" ON contact_submissions;
DROP POLICY IF EXISTS "authenticated_select_contact" ON contact_submissions;
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated can view contact submissions" ON contact_submissions;

-- Allow anonymous INSERT (public contact form)
CREATE POLICY "anon_insert_contact"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users can read submissions (back-office)
CREATE POLICY "authenticated_select_contact"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- No UPDATE or DELETE for anon. Authenticated admins can manage via service_role.
-- If you need admin DELETE from the back-office, add this policy:
-- CREATE POLICY "admin_delete_contact" ON contact_submissions
--   FOR DELETE TO authenticated
--   USING (EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));


-- ============================================
-- SECTION 2: Reinforce RLS on ALL back-office tables
-- ============================================
-- All these tables already have RLS enabled from prior migrations.
-- These statements are idempotent safeguards in case a migration was skipped.

ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Force-deny anon on tables that should never be publicly accessible.
-- These use the "TO" clause to explicitly target the anon role.
-- If RLS is enabled and there is NO policy granting access to anon,
-- access is already denied. These are belt-and-suspenders safeguards.

-- Revoke direct table access from anon on sensitive tables.
-- Even with RLS, explicit REVOKE provides defense-in-depth.
REVOKE ALL ON passengers FROM anon;
REVOKE ALL ON staff FROM anon;
REVOKE ALL ON reservation_requests FROM anon;
REVOKE ALL ON reservation_audit_log FROM anon;
REVOKE ALL ON suppliers FROM anon;
REVOKE ALL ON agents FROM anon;
REVOKE ALL ON boats FROM anon;
REVOKE ALL ON daily_notes FROM anon;
REVOKE ALL ON meal_schedules FROM anon;
REVOKE ALL ON passenger_meals FROM anon;
REVOKE ALL ON reservations FROM anon;


-- ============================================
-- SECTION 3: tours — Verify public SELECT, block anon writes
-- ============================================
-- tours already has RLS enabled (v7) and v14 restricted writes to admin.
-- Ensure no leftover permissive write policies exist for anon.

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- The existing "Public items are viewable by everyone" policy (v7)
-- uses USING(true) which allows anon SELECT. This is correct for a catalog.

-- Revoke direct INSERT/UPDATE/DELETE from anon as defense-in-depth.
-- (SELECT remains granted for the public catalog to work with RLS policies)
REVOKE INSERT, UPDATE, DELETE ON tours FROM anon;


-- ============================================
-- SECTION 4: OpenAPI / Swagger Endpoint
-- ============================================
-- Supabase hosted projects expose the PostgREST OpenAPI (Swagger)
-- endpoint by default. This CANNOT be disabled from SQL migrations.
--
-- TO DISABLE:
--   1. Go to Supabase Dashboard → Settings → API
--   2. Under "Data API Settings", disable "Schema" for 'public'
--      if you want to completely hide the schema.
--   OR (recommended):
--   3. With RLS properly enabled on all tables (as done above),
--      the Swagger endpoint only exposes table/column names (metadata),
--      NOT actual data. This is acceptable for most threat models.
--
-- ADDITIONAL HARDENING (optional):
--   - In Supabase Dashboard → Settings → API → "Exposed schemas":
--     Keep only 'public' (remove any extra schemas).
--   - Consider adding a Vercel Edge Middleware to block direct
--     access to /.well-known/ or /rest/v1/ if proxied through your domain.
--
-- With RLS enforced on every table (this migration), the Swagger
-- endpoint is informational-only and poses minimal risk.


-- ============================================
-- SECTION 5: Verify no overly-permissive policies remain
-- ============================================
-- The v14 migration already dropped the dangerous "Agents can view all agents"
-- policy (USING true → allows anon). This section cleans up any stragglers.

-- Drop the old v6 permissive delete policy if it was re-applied after v14
DROP POLICY IF EXISTS "Authenticated can delete reservations" ON reservations;
-- v14's "Admin can delete reservations" is the correct replacement.
-- Re-create it idempotently in case v14 wasn't fully applied:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reservations' AND policyname = 'Admin can delete reservations'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admin can delete reservations"
        ON reservations FOR DELETE
        USING (
          auth.role() = 'authenticated'
          AND EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
        )
    $policy$;
  END IF;
END $$;


-- ============================================
-- DONE. Run the verification query below to confirm RLS status:
-- ============================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Expected: ALL tables should show rowsecurity = true
