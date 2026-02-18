-- ============================================
-- Atitlán Experiences — Back-Office Schema V3
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add Emergency Contact to Reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- 2. Add Contact Info to Passengers
ALTER TABLE passengers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
