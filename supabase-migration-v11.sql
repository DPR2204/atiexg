-- ============================================
-- V11: Suppliers / Contacts table
-- ============================================

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'otro'
    CHECK (category IN ('transporte', 'masajes', 'restaurantes', 'hospedaje', 'actividades', 'otro')),
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view suppliers
CREATE POLICY "authenticated_select_suppliers" ON suppliers
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "admin_manage_suppliers" ON suppliers
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM agents WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_active ON suppliers(active) WHERE active = true;
