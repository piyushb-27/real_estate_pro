-- ============================================================
-- Real Estate Management — Simplified Schema (7 tables)
-- Run this in Supabase SQL Editor AFTER dropping old tables
-- ============================================================

-- ===================== DROP OLD TABLES =====================
DROP POLICY IF EXISTS "Allow all for anon" ON commission_logs;
DROP POLICY IF EXISTS "Allow all for anon" ON payments;
DROP POLICY IF EXISTS "Allow all for anon" ON deals;
DROP POLICY IF EXISTS "Allow all for anon" ON property_visits;
DROP POLICY IF EXISTS "Allow all for anon" ON property_listings;
DROP POLICY IF EXISTS "Allow all for anon" ON properties;
DROP POLICY IF EXISTS "Allow all for anon" ON clients;
DROP POLICY IF EXISTS "Allow all for anon" ON agents;
DROP POLICY IF EXISTS "Allow all for anon" ON agencies;
DROP POLICY IF EXISTS "Allow all for anon" ON property_categories;

DROP TABLE IF EXISTS commission_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS property_visits CASCADE;
DROP TABLE IF EXISTS property_listings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;
DROP TABLE IF EXISTS property_categories CASCADE;

-- ===================== NEW SCHEMA =====================

CREATE TABLE property_categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agents (
  agent_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(30),
  agency_name VARCHAR(255),
  experience_years INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clients (
  client_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  budget NUMERIC(12,2) DEFAULT 0,
  preferred_city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
  property_id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES property_categories(category_id),
  agent_id INT REFERENCES agents(agent_id),
  owner_name VARCHAR(200) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100) NOT NULL,
  locality VARCHAR(100),
  area_sqft NUMERIC(10,2) NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  furnishing_status VARCHAR(30) DEFAULT 'semi-furnished',
  built_year INT,
  listing_type VARCHAR(20) DEFAULT 'sale',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deals (
  deal_id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(property_id),
  client_id INT NOT NULL REFERENCES clients(client_id),
  deal_type VARCHAR(20) DEFAULT 'sale',
  deal_status VARCHAR(20) DEFAULT 'pending',
  agreed_price NUMERIC(12,2) NOT NULL,
  commission_rate_pct NUMERIC(5,2) NOT NULL DEFAULT 2.00 CHECK (commission_rate_pct >= 0.50 AND commission_rate_pct <= 10.00),
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  deal_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  deal_id INT NOT NULL REFERENCES deals(deal_id),
  amount NUMERIC(12,2) NOT NULL,
  method VARCHAR(20) DEFAULT 'bank_transfer',
  status VARCHAR(20) DEFAULT 'pending',
  transaction_ref VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commission_logs (
  log_id SERIAL PRIMARY KEY,
  deal_id INT NOT NULL REFERENCES deals(deal_id),
  agent_id INT NOT NULL REFERENCES agents(agent_id),
  commission_amount NUMERIC(12,2) NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ROW LEVEL SECURITY =====================

ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for anon" ON property_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON commission_logs FOR ALL USING (true) WITH CHECK (true);
