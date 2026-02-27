-- ============================================
-- Migration v13: Add meal_type to meal_schedules
-- ============================================

ALTER TABLE meal_schedules ADD COLUMN IF NOT EXISTS meal_type TEXT
  CHECK (meal_type IN ('desayuno','almuerzo','coffee_break','snacks','picnic','cena'));
