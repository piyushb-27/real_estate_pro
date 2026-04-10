-- Add commission configuration directly on deals
-- Run this once in Supabase SQL editor for existing projects

ALTER TABLE deals
ADD COLUMN IF NOT EXISTS commission_rate_pct NUMERIC(5,2) NOT NULL DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE deals
DROP CONSTRAINT IF EXISTS deals_commission_rate_pct_check;

ALTER TABLE deals
ADD CONSTRAINT deals_commission_rate_pct_check
CHECK (commission_rate_pct >= 0.50 AND commission_rate_pct <= 10.00);

-- Backfill for existing rows
UPDATE deals
SET
  commission_rate_pct = COALESCE(NULLIF(commission_rate_pct, 0), 2.00),
  commission_amount = CASE
    WHEN COALESCE(commission_amount, 0) > 0 THEN commission_amount
    ELSE ROUND((agreed_price * COALESCE(NULLIF(commission_rate_pct, 0), 2.00)) / 100.0, 2)
  END;
