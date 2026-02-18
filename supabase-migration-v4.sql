-- Migration v4: Add public_token and RPCs for Guest Portal

-- 1. Add public_token column to reservations
ALTER TABLE reservations
ADD COLUMN public_token uuid DEFAULT gen_random_uuid() NOT NULL;

ALTER TABLE reservations
ADD CONSTRAINT reservations_public_token_key UNIQUE (public_token);

CREATE INDEX idx_reservations_public_token ON reservations(public_token);

-- 2. RPC to get reservation details by token (Bypassing RLS securely)
CREATE OR REPLACE FUNCTION get_public_reservation(token_input uuid)
RETURNS TABLE (
  id INT,
  tour_name TEXT,
  tour_date DATE,
  start_time TIME,
  status TEXT,
  pax_count INT,
  agent_name TEXT,
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
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', p.id,
          'full_name', p.full_name,
          'age', p.age,
          'id_document', p.id_document
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

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION get_public_reservation(uuid) TO anon, authenticated, service_role;

-- 3. RPC to register a passenger (Bypassing RLS securely)
CREATE OR REPLACE FUNCTION register_public_passenger(
  p_token uuid,
  p_full_name text,
  p_age int,
  p_id_document text,
  p_email text,
  p_phone text,
  p_meals jsonb
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

  -- 2. Insert Passenger
  INSERT INTO passengers (reservation_id, full_name, age, id_document, email, phone)
  VALUES (v_res_id, p_full_name, p_age, p_id_document, p_email, p_phone)
  RETURNING id INTO v_pax_id;

  -- 3. Insert Meals (Iterate over jsonb keys)
  -- Expected format: {"almuerzo": {"food": "Pollo", "notes": "Sin gluten"}, ...}
  
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

-- Allow public access to this function
GRANT EXECUTE ON FUNCTION register_public_passenger(uuid, text, int, text, text, text, jsonb) TO anon, authenticated, service_role;
