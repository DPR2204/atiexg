-- Inspection script
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('passengers', 'passenger_meals')
ORDER BY table_name, ordinal_position;
