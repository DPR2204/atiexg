-- ============================================
-- Migration v14: Security hardening
-- ============================================

-- 1. Remove hardcoded admin email from handle_new_user trigger.
--    All new users now get 'agent' role. Promote admins manually:
--    UPDATE agents SET role = 'admin' WHERE email = 'someone@example.com';
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agents (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Restrict agents table: only authenticated users can read agents
DROP POLICY IF EXISTS "Agents can view all agents" ON agents;
CREATE POLICY "Authenticated can view agents"
  ON agents FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Restrict reservation UPDATE to owner or admin
DROP POLICY IF EXISTS "Authenticated can update reservations" ON reservations;
CREATE POLICY "Owner or admin can update reservations"
  ON reservations FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      agent_id = auth.uid()
      OR agent_id IS NULL
      OR EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
  );

-- 4. Restrict reservation DELETE to admin only
DROP POLICY IF EXISTS "Authenticated can delete reservations" ON reservations;
CREATE POLICY "Admin can delete reservations"
  ON reservations FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 5. Restrict passenger access to reservation owner or admin
DROP POLICY IF EXISTS "Authenticated can view passengers" ON passengers;
DROP POLICY IF EXISTS "Authenticated can manage passengers" ON passengers;

CREATE POLICY "Owner or admin can view passengers"
  ON passengers FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND (
      EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.id = passengers.reservation_id
        AND (r.agent_id = auth.uid() OR r.agent_id IS NULL)
      )
      OR EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
  );

CREATE POLICY "Owner or admin can manage passengers"
  ON passengers FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND (
      EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.id = passengers.reservation_id
        AND (r.agent_id = auth.uid() OR r.agent_id IS NULL)
      )
      OR EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    )
  );

-- 6. Restrict tour management to admin only (public can still read)
DROP POLICY IF EXISTS "Authenticated can insert tours" ON tours;
DROP POLICY IF EXISTS "Authenticated can update tours" ON tours;
DROP POLICY IF EXISTS "Authenticated can delete tours" ON tours;

CREATE POLICY "Admin can insert tours"
  ON tours FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admin can update tours"
  ON tours FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admin can delete tours"
  ON tours FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- 7. Restrict audit log INSERT to prevent forged entries
DROP POLICY IF EXISTS "Authenticated can insert audit log" ON reservation_audit_log;
CREATE POLICY "Verified agent can insert audit log"
  ON reservation_audit_log FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND agent_id = auth.uid()
  );

-- 8. Add pax limit check to register_public_passenger
-- (Recreate the function with the safety check)
CREATE OR REPLACE FUNCTION register_public_passenger(
  p_token uuid,
  p_full_name text,
  p_age integer DEFAULT NULL,
  p_id_document text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_dietary_notes text DEFAULT NULL,
  p_existing_id integer DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_reservation_id integer;
  v_pax_count integer;
  v_current_count integer;
  v_passenger_id integer;
BEGIN
  -- Look up the reservation by public token
  SELECT id, pax_count INTO v_reservation_id, v_pax_count
  FROM reservations
  WHERE public_token = p_token;

  IF v_reservation_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reservation not found');
  END IF;

  -- Count existing passengers
  SELECT COUNT(*) INTO v_current_count
  FROM passengers
  WHERE reservation_id = v_reservation_id;

  -- If updating existing passenger, allow it
  IF p_existing_id IS NOT NULL THEN
    UPDATE passengers SET
      full_name = COALESCE(p_full_name, full_name),
      age = COALESCE(p_age, age),
      id_document = COALESCE(p_id_document, id_document),
      email = COALESCE(p_email, email),
      phone = COALESCE(p_phone, phone),
      dietary_notes = COALESCE(p_dietary_notes, dietary_notes)
    WHERE id = p_existing_id AND reservation_id = v_reservation_id;

    RETURN jsonb_build_object('success', true, 'passenger_id', p_existing_id);
  END IF;

  -- Enforce pax limit for new passengers
  IF v_pax_count IS NOT NULL AND v_current_count >= v_pax_count THEN
    RETURN jsonb_build_object('success', false, 'error', 'Passenger limit reached for this reservation');
  END IF;

  -- Insert new passenger
  INSERT INTO passengers (reservation_id, full_name, age, id_document, email, phone, dietary_notes)
  VALUES (v_reservation_id, p_full_name, p_age, p_id_document, p_email, p_phone, p_dietary_notes)
  RETURNING id INTO v_passenger_id;

  RETURN jsonb_build_object('success', true, 'passenger_id', v_passenger_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
