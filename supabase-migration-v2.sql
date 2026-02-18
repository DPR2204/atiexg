-- ============================================
-- Atitlán Experiences — Back-Office Schema V2
-- Run this in Supabase SQL Editor AFTER v1 migration
-- ============================================

-- 1. Audit trail for reservation changes
CREATE TABLE reservation_audit_log (
  id SERIAL PRIMARY KEY,
  reservation_id INT REFERENCES reservations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id),
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'deleted'
  field_changed TEXT,   -- 'status', 'pax_count', 'boat_id', 'tour_date', etc.
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Commission rate on agents (default 5%)
ALTER TABLE agents ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00;

-- 3. End date for multi-day tours
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS end_date DATE;

-- 4. Payment tracking fields
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_url TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- 5. Per-passenger meals (replaces single food_order field)
CREATE TABLE passenger_meals (
  id SERIAL PRIMARY KEY,
  passenger_id INT NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('desayuno','almuerzo','coffee_break','snacks','picnic','cena')),
  food_order TEXT,
  dietary_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS for new tables
-- ============================================
ALTER TABLE reservation_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_meals ENABLE ROW LEVEL SECURITY;

-- Audit log: all authenticated can view, system inserts
CREATE POLICY "Authenticated can view audit log"
  ON reservation_audit_log FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can insert audit log"
  ON reservation_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Passenger meals: same as passengers
CREATE POLICY "Authenticated can view passenger meals"
  ON passenger_meals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can manage passenger meals"
  ON passenger_meals FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- Index for fast audit log lookups
-- ============================================
CREATE INDEX idx_audit_log_reservation ON reservation_audit_log(reservation_id);
CREATE INDEX idx_audit_log_agent ON reservation_audit_log(agent_id);
CREATE INDEX idx_passenger_meals_passenger ON passenger_meals(passenger_id);
