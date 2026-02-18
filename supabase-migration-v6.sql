-- Migration v6: Update register_public_passenger to support edits

-- Drop previous version first to avoid return type issues if signature changes
DROP FUNCTION IF EXISTS register_public_passenger(uuid, text, int, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION register_public_passenger(
  p_token uuid,
  p_full_name text,
  p_age int,
  p_id_document text,
  p_email text,
  p_phone text,
  p_meals jsonb,
  p_passenger_id int DEFAULT NULL -- New optional parameter for updates
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_res_id INT;
  v_pax_id INT;
  v_meal_type text;
  v_meal_data jsonb;
BEGIN
  -- 1. Validate token and get reservation ID
  SELECT id INTO v_res_id FROM reservations WHERE public_token = p_token;

  IF v_res_id IS NULL THEN
    RAISE EXCEPTION 'Invalid token';
  END IF;

  -- 2. Insert or Update Passenger
  IF p_passenger_id IS NOT NULL THEN
    -- Verify passenger belongs to this reservation before updating
    UPDATE passengers 
    SET 
      full_name = p_full_name,
      age = p_age,
      id_document = p_id_document,
      email = p_email,
      phone = p_phone
    WHERE id = p_passenger_id AND reservation_id = v_res_id
    RETURNING id INTO v_pax_id;
    
    IF v_pax_id IS NULL THEN
        RAISE EXCEPTION 'Passenger not found or does not belong to this reservation';
    END IF;

    -- Clear existing meals for this passenger to re-insert them
    DELETE FROM passenger_meals WHERE passenger_id = v_pax_id;

  ELSE
    -- Insert new
    INSERT INTO passengers (reservation_id, full_name, age, id_document, email, phone)
    VALUES (v_res_id, p_full_name, p_age, p_id_document, p_email, p_phone)
    RETURNING id INTO v_pax_id;
  END IF;

  -- 3. Insert Meals (Iterate over jsonb keys) - Logic remains same for both insert/update
  FOR v_meal_type, v_meal_data IN SELECT * FROM jsonb_each(p_meals)
  LOOP
    IF v_meal_data->>'food' <> '' OR v_meal_data->>'notes' <> '' THEN
      INSERT INTO passenger_meals (passenger_id, meal_type, food_order, dietary_notes)
      VALUES (
        v_pax_id,
        v_meal_type,
        v_meal_data->>'food',
        v_meal_data->>'notes'
      );
    END IF;
  END LOOP;

  RETURN json_build_object('success', true, 'passenger_id', v_pax_id);
END;
$$;

-- 3. Update get_public_reservation to include meals for editing
DROP FUNCTION IF EXISTS get_public_reservation(uuid);

CREATE OR REPLACE FUNCTION get_public_reservation(token_input uuid)
RETURNS TABLE (
  id INT,
  tour_name TEXT,
  tour_date DATE,
  start_time TIME,
  status TEXT,
  pax_count INT,
  agent_name TEXT,
  meal_options JSONB,
  passengers JSON
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.tour_name,
    r.tour_date,
    r.start_time,
    r.status,
    r.pax_count,
    a.name as agent_name,
    r.meal_options,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'age', p.age,
          'id_document', p.id_document,
          'email', p.email,
          'phone', p.phone,
          'meals', (
             SELECT COALESCE(json_agg(json_build_object(
               'meal_type', pm.meal_type,
               'food', pm.food_order,
               'notes', pm.dietary_notes
             )), '[]'::json)
             FROM passenger_meals pm
             WHERE pm.passenger_id = p.id
          )
        ))
        FROM passengers p
        WHERE p.reservation_id = r.id
      ),
      '[]'::json
    ) as passengers
  FROM reservations r
  LEFT JOIN agents a ON r.agent_id = a.id
  WHERE r.public_token = token_input
  AND r.status NOT IN ('cancelled');
END;
$$;

-- 4. Fix Reservation Deletion Policy
-- Allow authenticated agents to delete reservations (or at least their own, but simpler for now)
DROP POLICY IF EXISTS "Authenticated can delete reservations" ON reservations;
CREATE POLICY "Authenticated can delete reservations" ON reservations FOR DELETE USING ( auth.role() = 'authenticated' );
