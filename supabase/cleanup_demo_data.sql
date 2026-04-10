-- Purge all app data for fresh end-to-end testing
-- NOTE: This project uses Supabase (PostgreSQL), not MySQL.
-- Run this script in Supabase SQL Editor.

BEGIN;

TRUNCATE TABLE
  commission_logs,
  payments,
  deals,
  properties,
  clients,
  agents,
  property_categories
RESTART IDENTITY CASCADE;

COMMIT;
