-- v10: Add performance indexes to reservations table
-- These indexes address sequential scan performance issues on the most-queried table

CREATE INDEX IF NOT EXISTS idx_reservations_tour_date ON reservations(tour_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_agent_id ON reservations(agent_id);
CREATE INDEX IF NOT EXISTS idx_reservations_tour_id ON reservations(tour_id);

-- Fix nullable columns on tours table that should have NOT NULL
ALTER TABLE tours ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE tours ALTER COLUMN active SET NOT NULL;
ALTER TABLE tours ALTER COLUMN active SET DEFAULT true;
