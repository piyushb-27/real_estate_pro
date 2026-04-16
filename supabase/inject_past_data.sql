-- Run this script in your Supabase SQL Editor to inject past data for Feb and Mar 2026

DO $$
DECLARE
  v_category_id INT;
  v_agent_id INT;
  v_client_id INT;
  v_property_id INT;
  v_deal_id INT;
BEGIN
  -- Get existing or create basics
  SELECT category_id INTO v_category_id FROM property_categories LIMIT 1;
  IF v_category_id IS NULL THEN
    INSERT INTO property_categories (name) VALUES ('Commercial') RETURNING category_id INTO v_category_id;
  END IF;

  SELECT agent_id INTO v_agent_id FROM agents LIMIT 1;
  IF v_agent_id IS NULL THEN
    INSERT INTO agents (first_name, email) VALUES ('Michael', 'michael.scott@example.com') RETURNING agent_id INTO v_agent_id;
  END IF;

  SELECT client_id INTO v_client_id FROM clients LIMIT 1;
  IF v_client_id IS NULL THEN
    INSERT INTO clients (first_name, email) VALUES ('Dwight', 'dwight.schrute@example.com') RETURNING client_id INTO v_client_id;
  END IF;

  -- 1. Large Rent Deal in Feb 2026 (7 Lakh Commission)
  INSERT INTO properties (category_id, agent_id, owner_name, title, city, locality, area_sqft, listing_type, price, status, created_at)
  VALUES (v_category_id, v_agent_id, 'Wayne Enterprises', 'Corporate HQ Office', 'Mumbai', 'Bandra Kurla Complex', 15000, 'rent', 35000000, 'rented', '2026-02-01 10:00:00')
  RETURNING property_id INTO v_property_id;

  INSERT INTO deals (property_id, client_id, deal_type, deal_status, agreed_price, commission_rate_pct, commission_amount, deal_date, created_at)
  VALUES (v_property_id, v_client_id, 'rent', 'closed', 35000000, 2.00, 700000, '2026-02-15 14:30:00', '2026-02-15 14:30:00')
  RETURNING deal_id INTO v_deal_id;

  INSERT INTO payments (deal_id, amount, status, method, paid_at, created_at)
  VALUES (v_deal_id, 700000, 'completed', 'bank_transfer', '2026-02-18 10:00:00', '2026-02-18 10:00:00');

  -- 2. Another Rent Deal in Feb 2026 (4.5 Lakh Commission)
  INSERT INTO properties (category_id, agent_id, owner_name, title, city, locality, area_sqft, listing_type, price, status, created_at)
  VALUES (v_category_id, v_agent_id, 'Stark Industries', 'Warehouse Facility', 'Delhi', 'Okhla', 8000, 'rent', 22500000, 'rented', '2026-02-05 10:00:00')
  RETURNING property_id INTO v_property_id;

  INSERT INTO deals (property_id, client_id, deal_type, deal_status, agreed_price, commission_rate_pct, commission_amount, deal_date, created_at)
  VALUES (v_property_id, v_client_id, 'rent', 'closed', 22500000, 2.00, 450000, '2026-02-22 11:15:00', '2026-02-22 11:15:00')
  RETURNING deal_id INTO v_deal_id;

  INSERT INTO payments (deal_id, amount, status, method, paid_at, created_at)
  VALUES (v_deal_id, 450000, 'completed', 'cheque', '2026-02-25 10:00:00', '2026-02-25 10:00:00');

  -- 3. Deal in March 2026 (Sale - 3.4 Lakh Commission)
  INSERT INTO properties (category_id, agent_id, owner_name, title, city, locality, area_sqft, listing_type, price, status, created_at)
  VALUES (v_category_id, v_agent_id, 'Bruce Wayne', 'Luxury Penthouse', 'Bangalore', 'Indiranagar', 3200, 'sale', 17000000, 'sold', '2026-03-01 10:00:00')
  RETURNING property_id INTO v_property_id;

  INSERT INTO deals (property_id, client_id, deal_type, deal_status, agreed_price, commission_rate_pct, commission_amount, deal_date, created_at)
  VALUES (v_property_id, v_client_id, 'sale', 'closed', 17000000, 2.00, 340000, '2026-03-12 16:45:00', '2026-03-12 16:45:00')
  RETURNING deal_id INTO v_deal_id;

  INSERT INTO payments (deal_id, amount, status, method, paid_at, created_at)
  VALUES (v_deal_id, 340000, 'completed', 'bank_transfer', '2026-03-15 10:00:00', '2026-03-15 10:00:00');

END $$;
