-- Migration v5: Add meal_options to reservations

-- 1. Add meal_options column
ALTER TABLE reservations
ADD COLUMN meal_options JSONB DEFAULT '{}'::jsonb;

-- 2. Update get_public_reservation RPC to include meal_options
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
