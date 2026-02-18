-- ============================================
-- Atitlán Experiences — Back-Office Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Agents profile table (linked to Supabase Auth)
CREATE TABLE agents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Boats
CREATE TABLE boats (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the 2 boats
INSERT INTO boats (name, capacity) VALUES
  ('Lancha 1', 10),
  ('Lancha 2', 10);

-- 3. Staff (lancheros & guías)
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('lanchero', 'guia')),
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Reservations
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  tour_id INT NOT NULL,
  tour_name TEXT NOT NULL,
  agent_id UUID REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'reserved', 'paid', 'in_progress', 'completed', 'cancelled')),
  tour_date DATE NOT NULL,
  start_time TIME,
  boat_id INT REFERENCES boats(id),
  driver_id INT REFERENCES staff(id),
  guide_id INT REFERENCES staff(id),
  pax_count INT NOT NULL DEFAULT 1,
  deposit_amount DECIMAL(10,2) DEFAULT 50.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  custom_stops JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Passengers
CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INT,
  id_document TEXT,
  food_order TEXT,
  dietary_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Meal schedules
CREATE TABLE meal_schedules (
  id SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  arrival_time TIME,
  pax_count INT,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_schedules ENABLE ROW LEVEL SECURITY;

-- Agents can read all agents, but only update their own profile
CREATE POLICY "Agents can view all agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Agents can update own profile" ON agents FOR UPDATE USING (auth.uid() = id);

-- All authenticated users can read boats and staff
CREATE POLICY "Authenticated can view boats" ON boats FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can view staff" ON staff FOR SELECT USING (auth.role() = 'authenticated');

-- Admin can manage boats and staff
CREATE POLICY "Admin can manage boats" ON boats FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can manage staff" ON staff FOR ALL USING (
  EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role = 'admin')
);

-- All authenticated users can CRUD reservations
CREATE POLICY "Authenticated can view reservations" ON reservations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can create reservations" ON reservations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can update reservations" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete reservations" ON reservations FOR DELETE USING (
  EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role = 'admin')
);

-- Passengers: same as reservations
CREATE POLICY "Authenticated can view passengers" ON passengers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage passengers" ON passengers FOR ALL USING (auth.role() = 'authenticated');

-- Meal schedules: same
CREATE POLICY "Authenticated can view meals" ON meal_schedules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated can manage meals" ON meal_schedules FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Auto-update updated_at on reservations
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function to auto-create agent profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO agents (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.email = 'davidrodasvas@pm.me' THEN 'admin' ELSE 'agent' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
