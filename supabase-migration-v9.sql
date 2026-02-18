-- Migration v9: Agent Portal Enhancements (Flexible Add-ons, Group Meals, Manual Price)

-- 1. Add new columns to reservations table (and cleanup previous v9 attempt if needed)
-- We rename addons_ids -> selected_addons which stores objects: [{ label: string, price: number }]
ALTER TABLE reservations 
DROP COLUMN IF EXISTS addons_ids, -- In case it was already created by previous v9 run
ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS meal_per_group BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_manual BOOLEAN DEFAULT false;

-- 2. Update get_public_reservation function to include new fields
-- Also remove the restrictive CHECK constraint on passenger_meals to allow flexible meal types
ALTER TABLE passenger_meals DROP CONSTRAINT IF EXISTS passenger_meals_meal_type_check;

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
  custom_tour_data JSONB,
  tour_includes TEXT,
  tour_itinerary JSONB,
  passengers JSON,
  payment_url TEXT,
  boat_name TEXT,
  driver_name TEXT,
  guide_name TEXT,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  selected_addons JSONB,  -- Changed from addons_ids
  meal_per_group BOOLEAN,
  tour_price NUMERIC   -- Added base price
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
    r.custom_tour_data,
    t.includes as tour_includes,
    t.itinerary as tour_itinerary,
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
    ) as passengers,
    r.payment_url,
    b.name as boat_name,
    d.name as driver_name,
    g.name as guide_name,
    r.total_amount,
    r.paid_amount,
    r.selected_addons,
    r.meal_per_group,
    t.price as tour_price
  FROM reservations r
  LEFT JOIN agents a ON r.agent_id = a.id
  LEFT JOIN tours t ON r.tour_id = t.id
  LEFT JOIN boats b ON r.boat_id = b.id
  LEFT JOIN staff d ON r.driver_id = d.id
  LEFT JOIN staff g ON r.guide_id = g.id
  WHERE r.public_token = token_input
  AND r.status NOT IN ('cancelled');
END;
$$;

-- Grant permissions again for safety
GRANT EXECUTE ON FUNCTION get_public_reservation(uuid) TO anon, authenticated, service_role;

-- 3. Ensure register_public_passenger is up to date and working
DROP FUNCTION IF EXISTS register_public_passenger(uuid, text, int, text, text, text, jsonb, int);

CREATE OR REPLACE FUNCTION register_public_passenger(
  p_token uuid,
  p_full_name text,
  p_age int,
  p_id_document text,
  p_email text,
  p_phone text,
  p_meals jsonb,
  p_passenger_id int DEFAULT NULL
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

  -- 3. Insert Meals (Iterate over jsonb keys)
  -- Expected p_meals format: { "desayuno": { "food": "Omelet", "notes": "No onion" }, ... }
  IF p_meals IS NOT NULL THEN
      FOR v_meal_type, v_meal_data IN SELECT * FROM jsonb_each(p_meals)
      LOOP
        -- Only insert if there's actual data
        IF (v_meal_data->>'food') IS NOT NULL AND (v_meal_data->>'food') <> '' THEN
          INSERT INTO passenger_meals (passenger_id, meal_type, food_order, dietary_notes)
          VALUES (
            v_pax_id,
            v_meal_type,
            v_meal_data->>'food',
            v_meal_data->>'notes'
          );
        END IF;
      END LOOP;
  END IF;

  RETURN json_build_object('success', true, 'passenger_id', v_pax_id);
END;
$$;

GRANT EXECUTE ON FUNCTION register_public_passenger(uuid, text, int, text, text, text, jsonb, int) TO anon, authenticated, service_role;
