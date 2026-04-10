-- One-time repair for sequence drift after manual/explicit ID inserts
-- Run in Supabase SQL Editor

BEGIN;

SELECT setval('property_categories_category_id_seq', COALESCE((SELECT MAX(category_id) FROM property_categories), 1), true);
SELECT setval('agents_agent_id_seq', COALESCE((SELECT MAX(agent_id) FROM agents), 1), true);
SELECT setval('clients_client_id_seq', COALESCE((SELECT MAX(client_id) FROM clients), 1), true);
SELECT setval('properties_property_id_seq', COALESCE((SELECT MAX(property_id) FROM properties), 1), true);
SELECT setval('deals_deal_id_seq', COALESCE((SELECT MAX(deal_id) FROM deals), 1), true);
SELECT setval('payments_payment_id_seq', COALESCE((SELECT MAX(payment_id) FROM payments), 1), true);
SELECT setval('commission_logs_log_id_seq', COALESCE((SELECT MAX(log_id) FROM commission_logs), 1), true);

COMMIT;
