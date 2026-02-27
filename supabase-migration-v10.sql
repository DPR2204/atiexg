-- ============================================
-- V10: Reservation Requests (change request threads)
-- Run this in Supabase SQL Editor
-- ============================================

CREATE TABLE reservation_requests (
  id SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES agents(id),
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_by UUID REFERENCES agents(id),
  resolver_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE reservation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select" ON reservation_requests
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON reservation_requests
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update" ON reservation_requests
  FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_requests_reservation ON reservation_requests(reservation_id);
CREATE INDEX idx_requests_status ON reservation_requests(status) WHERE status = 'pending';
