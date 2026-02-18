-- Migration v8: Logistics & Payment Info in Public Reservation
-- Updates the get_public_reservation function to include boat, driver, guide names and payment link

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
  payment_url TEXT,     -- Added
  boat_name TEXT,       -- Added
  driver_name TEXT,     -- Added
  guide_name TEXT,      -- Added
  total_amount NUMERIC,  -- Added for context
  paid_amount NUMERIC    -- Added for context
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
    r.paid_amount
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
