-- ============================================
-- Migration v12: Daily operational notes
-- ============================================

-- Daily notes for operational coordination (lake conditions, announcements, etc.)
CREATE TABLE IF NOT EXISTS daily_notes (
  id SERIAL PRIMARY KEY,
  note_date DATE NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES agents(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_notes_date ON daily_notes(note_date);

ALTER TABLE daily_notes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view daily notes
CREATE POLICY "Authenticated can view daily_notes" ON daily_notes
  FOR SELECT TO authenticated USING (true);

-- All authenticated users can create/update daily notes
CREATE POLICY "Authenticated can insert daily_notes" ON daily_notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update daily_notes" ON daily_notes
  FOR UPDATE TO authenticated USING (true);
