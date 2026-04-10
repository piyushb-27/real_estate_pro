-- ============================================================
-- EstateFlow: full reset + realistic demo seed
-- Run in Supabase SQL Editor
-- ============================================================

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

INSERT INTO property_categories (category_id, name)
VALUES
  (1, 'Apartment'),
  (2, 'Villa'),
  (3, 'Independent House'),
  (4, 'Commercial Office'),
  (5, 'Shop'),
  (6, 'Plot / Land');

INSERT INTO agents (agent_id, first_name, last_name, email, phone, agency_name, experience_years)
VALUES
  (1, 'Aarav', 'Sharma', 'aarav.sharma@urbanflow.in', '+91-9000000101', 'UrbanFlow Realty', 6),
  (2, 'Isha', 'Mehta', 'isha.mehta@urbanflow.in', '+91-9000000102', 'UrbanFlow Realty', 4),
  (3, 'Rohan', 'Verma', 'rohan.verma@primekeys.in', '+91-9000000103', 'PrimeKeys', 8),
  (4, 'Neha', 'Kapoor', 'neha.kapoor@primekeys.in', '+91-9000000104', 'PrimeKeys', 5),
  (5, 'Kabir', 'Singh', 'kabir.singh@skylinehomes.in', '+91-9000000105', 'Skyline Homes', 7),
  (6, 'Mira', 'Nair', 'mira.nair@skylinehomes.in', '+91-9000000106', 'Skyline Homes', 3),
  (7, 'Aditya', 'Joshi', 'aditya.joshi@bluedoor.in', '+91-9000000107', 'BlueDoor Realty', 9),
  (8, 'Sana', 'Khan', 'sana.khan@bluedoor.in', '+91-9000000108', 'BlueDoor Realty', 3);

INSERT INTO clients (client_id, first_name, last_name, email, phone, budget, preferred_city)
VALUES
  (1, 'Vikram', 'Sethi', 'vikram.sethi@example.com', '+91-9100000201', 15500000, 'Bengaluru'),
  (2, 'Ananya', 'Gupta', 'ananya.gupta@example.com', '+91-9100000202', 22000000, 'Mumbai'),
  (3, 'Rahul', 'Nair', 'rahul.nair@example.com', '+91-9100000203', 18000000, 'Pune'),
  (4, 'Meera', 'Iyer', 'meera.iyer@example.com', '+91-9100000204', 1200000, 'Hyderabad'),
  (5, 'Farhan', 'Ali', 'farhan.ali@example.com', '+91-9100000205', 14500000, 'Delhi'),
  (6, 'Shruti', 'Desai', 'shruti.desai@example.com', '+91-9100000206', 9600000, 'Chennai'),
  (7, 'Karan', 'Bedi', 'karan.bedi@example.com', '+91-9100000207', 38000000, 'Gurugram'),
  (8, 'Pallavi', 'Joshi', 'pallavi.joshi@example.com', '+91-9100000208', 7200000, 'Ahmedabad'),
  (9, 'Nikhil', 'Chawla', 'nikhil.chawla@example.com', '+91-9100000209', 67000, 'Mumbai'),
  (10, 'Tanya', 'Reddy', 'tanya.reddy@example.com', '+91-9100000210', 48000, 'Bengaluru'),
  (11, 'Aman', 'Khanna', 'aman.khanna@example.com', '+91-9100000211', 115000, 'Noida'),
  (12, 'Ira', 'Menon', 'ira.menon@example.com', '+91-9100000212', 54000, 'Kochi');

INSERT INTO properties (
  property_id,
  category_id,
  agent_id,
  owner_name,
  title,
  description,
  city,
  locality,
  area_sqft,
  bedrooms,
  bathrooms,
  furnishing_status,
  built_year,
  listing_type,
  price,
  status
)
VALUES
  (1, 1, 1, 'Rakesh Gupta', 'Sunrise Heights 3BHK', 'Corner apartment with two balconies, city skyline views, and quick access to the metro.', 'Bengaluru', 'Whitefield', 1540, 3, 3, 'semi-furnished', 2019, 'sale', 12800000, 'sold'),
  (2, 1, 2, 'Mohan Sharma', 'Harbor View 2BHK', 'Well-planned home in a tower with sea breeze, gym access, and covered parking.', 'Mumbai', 'Andheri East', 980, 2, 2, 'furnished', 2021, 'sale', 14500000, 'available'),
  (3, 1, 3, 'Nitin Agarwal', 'Lakeview Residency 2BHK', 'Bright apartment with clubhouse access, jogging track, and open green space nearby.', 'Pune', 'Hinjewadi', 1120, 2, 2, 'semi-furnished', 2018, 'sale', 8900000, 'available'),
  (4, 1, 4, 'Pooja Batra', 'Skyline 3BHK Prime', 'Premium apartment in a gated tower with a long balcony and work-from-home nook.', 'Hyderabad', 'Gachibowli', 1685, 3, 3, 'furnished', 2020, 'sale', 18500000, 'available'),
  (5, 1, 5, 'Kiran Desai', 'Metroline Towers 4BHK', 'Large family residence close to schools, retail, and the main corridor.', 'Delhi', 'Dwarka', 2100, 4, 4, 'semi-furnished', 2017, 'sale', 16200000, 'available'),
  (6, 1, 6, 'Sahana Rao', 'Coral Crest 3BHK', 'Low-density community apartment with landscaped gardens and a quiet inner road.', 'Chennai', 'Adyar', 1510, 3, 3, 'furnished', 2022, 'sale', 17400000, 'sold'),
  (7, 2, 7, 'Arvind Rao', 'Palm Grove Villa', 'Corner villa in a gated enclave with private garden and generous parking.', 'Bengaluru', 'Sarjapur Road', 3200, 4, 4, 'furnished', 2021, 'sale', 28500000, 'available'),
  (8, 2, 8, 'Bhavna Sethi', 'Royal Crest Villa', 'Luxury villa with terrace lounge, landscaped lawn, and a quiet internal street.', 'Mumbai', 'Powai', 3650, 5, 5, 'furnished', 2020, 'sale', 41200000, 'sold'),
  (9, 2, 1, 'Suresh Menon', 'Hilltop Grand Villa', 'Contemporary villa with natural light, open kitchen, and private study room.', 'Hyderabad', 'Kondapur', 2900, 4, 4, 'semi-furnished', 2022, 'sale', 23800000, 'available'),
  (10, 2, 2, 'Mehul Jain', 'Ridge View Villa', 'Airy family villa on a wide road with a back lawn and rooftop sit-out.', 'Jaipur', 'Vaishali Nagar', 3050, 4, 4, 'semi-furnished', 2019, 'sale', 17600000, 'available'),
  (11, 3, 3, 'Arvind Rao', 'Classic Family House', 'Independent house near school district with a compact garden and utility room.', 'Pune', 'Kothrud', 1950, 3, 3, 'semi-furnished', 2016, 'sale', 17500000, 'available'),
  (12, 3, 4, 'Pritam Bose', 'Lakefront House', 'Quiet residential house with two living zones and easy access to main roads.', 'Kolkata', 'Salt Lake', 2250, 4, 3, 'unfurnished', 2014, 'sale', 14200000, 'sold'),
  (13, 3, 5, 'Anjali Menon', 'Maple Independent Home', 'Well-kept home with backyard, storage room, and a small front sit-out.', 'Ahmedabad', 'Bopal', 2400, 4, 3, 'semi-furnished', 2015, 'sale', 13600000, 'available'),
  (14, 4, 6, 'Mahesh Iyer', 'Orbit Tech Park Suite', 'Professional office suite with conference rooms, reception, and fast lift access.', 'Bengaluru', 'Outer Ring Road', 5000, 0, 3, 'furnished', 2020, 'sale', 38500000, 'available'),
  (15, 4, 7, 'Harish Patel', 'Infinity Business Loft', 'Corner commercial office with glass frontage and flexible workstation layout.', 'Noida', 'Sector 62', 6200, 0, 4, 'furnished', 2019, 'sale', 44000000, 'sold'),
  (16, 5, 8, 'Sana Khan', 'City Corner Retail Shop', 'Ground-floor retail unit in a high-footfall market with visible frontage.', 'Mumbai', 'Bandra West', 900, 0, 1, 'unfurnished', 2017, 'sale', 26500000, 'available'),
  (17, 6, 1, 'Devansh Malhotra', 'Greenfields Plot 2400', 'Residential corner plot with clear title, drainage access, and wide approach road.', 'Jaipur', 'Jagatpura', 2400, 0, 0, 'unfurnished', 0, 'sale', 6800000, 'sold'),
  (18, 6, 2, 'Rohit Bansal', 'North Avenue Plot 1800', 'East-facing land parcel suitable for duplex construction or a compact villa.', 'Lucknow', 'Gomti Nagar', 1800, 0, 0, 'unfurnished', 0, 'sale', 3900000, 'available'),
  (19, 1, 3, 'Naveen Kumar', 'Aqua Crescent 3BHK', 'Modern apartment with lake-facing windows and a covered utility balcony.', 'Navi Mumbai', 'Kharghar', 1250, 3, 2, 'semi-furnished', 2021, 'sale', 11900000, 'available'),
  (20, 1, 4, 'Nikhil Chawla', 'Harbour Edge 4BHK', 'Large apartment with open-plan living and a family room for remote work.', 'Thane', 'Hiranandani Estate', 1600, 4, 3, 'furnished', 2022, 'sale', 17800000, 'available'),
  (21, 1, 5, 'Rachit Sehgal', 'Canal Walk Residences', 'Functional apartment close to schools, cafes, and a daily needs market.', 'Chandigarh', 'Sector 20', 1450, 3, 3, 'semi-furnished', 2018, 'sale', 15400000, 'available'),
  (22, 1, 6, 'Ishita Verma', 'Lotus Ridge 2BHK', 'Low-rise apartment with open-air corridors and a practical bedroom layout.', 'Kochi', 'Kakkanad', 1080, 2, 2, 'unfurnished', 2020, 'sale', 7600000, 'available'),
  (23, 2, 7, 'Rajeev Khurana', 'Meadowline Villa', 'Family villa with garden seating, staff room, and a bright formal lounge.', 'Pune', 'Baner', 2750, 4, 4, 'semi-furnished', 2021, 'sale', 24900000, 'available'),
  (24, 2, 8, 'Priya Sen', 'Azure Court Villa', 'Corner villa with rooftop deck and a shaded patio for evening gatherings.', 'Bengaluru', 'Hebbal', 2980, 4, 4, 'furnished', 2023, 'sale', 36200000, 'available'),
  (25, 3, 1, 'Amit Khanna', 'Garden Street House', 'Independent home on a calm lane with a front courtyard and service kitchen.', 'Delhi', 'Vasant Kunj', 2280, 4, 4, 'semi-furnished', 2018, 'sale', 25700000, 'available'),
  (26, 3, 2, 'Sumeet Arora', 'Riverstone House', 'Spacious family house with attached office room and open terrace access.', 'Indore', 'Vijay Nagar', 2140, 4, 3, 'unfurnished', 2017, 'sale', 13200000, 'available'),
  (27, 4, 3, 'Tarun Khanna', 'Central Plaza Office', 'Efficient office floor with reception, meeting rooms, and backup power support.', 'Mumbai', 'Lower Parel', 7400, 0, 4, 'furnished', 2021, 'sale', 58200000, 'available'),
  (28, 4, 4, 'Nadia Farooqi', 'Aurora Workspaces', 'Commercial office with breakout zones and a premium lobby entrance.', 'Hyderabad', 'Madhapur', 6100, 0, 3, 'furnished', 2020, 'sale', 46800000, 'available'),
  (29, 5, 5, 'Jatin Malhotra', 'Market Square Shop', 'High-visibility retail unit near a busy junction with steady evening footfall.', 'Delhi', 'Connaught Place', 780, 0, 1, 'unfurnished', 2016, 'sale', 31500000, 'available'),
  (30, 6, 6, 'Gautam Patel', 'Suncrest Plot 2600', 'Regular-shaped residential plot with strong road frontage and easy utility connections.', 'Ahmedabad', 'Shilaj', 2600, 0, 0, 'unfurnished', 0, 'sale', 9200000, 'available'),

  (31, 1, 1, 'Imran Hussain', 'Clover Residency 1BHK', 'Compact rental apartment designed for young professionals and single occupants.', 'Bengaluru', 'Indiranagar', 700, 1, 1, 'furnished', 2022, 'rent', 42000, 'rented'),
  (32, 1, 2, 'Saloni Rao', 'Monarch 2BHK', 'Move-in ready rental flat with balcony, lift access, and neighborhood retail nearby.', 'Mumbai', 'Goregaon West', 940, 2, 2, 'semi-furnished', 2021, 'rent', 65000, 'available'),
  (33, 1, 3, 'Rehan Mirza', 'Green Court 2BHK', 'Sunny apartment with compact kitchen, two washrooms, and a practical layout.', 'Pune', 'Aundh', 1050, 2, 2, 'semi-furnished', 2020, 'rent', 36000, 'available'),
  (34, 1, 4, 'Nupur Shah', 'Vista Crest 3BHK', 'Family rental with large windows, utility space, and good access to IT parks.', 'Hyderabad', 'Madhapur', 1320, 3, 3, 'furnished', 2022, 'rent', 54000, 'rented'),
  (35, 2, 5, 'Arjun Mehra', 'Dunes Villa on Lease', 'Premium rental villa with lawn, terrace seating, and extra storage rooms.', 'Gurugram', 'DLF Phase 3', 2800, 4, 4, 'furnished', 2021, 'rent', 115000, 'available'),
  (36, 2, 6, 'Kavya Nambiar', 'Aster Villa Rental', 'Quiet villa rental with private driveway and a small backyard garden.', 'Noida', 'Sector 15', 2350, 3, 3, 'semi-furnished', 2020, 'rent', 88000, 'available'),
  (37, 3, 7, 'Farhan Siddiqui', 'Coastal House Lease', 'Independent rental house near the beach road with a small courtyard.', 'Chennai', 'Besant Nagar', 1750, 3, 3, 'furnished', 2019, 'rent', 62000, 'rented'),
  (38, 4, 8, 'Leena Thomas', 'Summit Office Floor', 'Flexible office lease with meeting pods, pantry, and secure access control.', 'Hyderabad', 'HITEC City', 5200, 0, 3, 'furnished', 2023, 'rent', 510000, 'available'),
  (39, 4, 1, 'Siddharth Jain', 'Junction Office Suite', 'Efficient commercial floor suitable for consulting, startups, or satellite teams.', 'Bengaluru', 'Jayanagar', 4300, 0, 2, 'semi-furnished', 2020, 'rent', 280000, 'available'),
  (40, 5, 2, 'Omar Farooq', 'Heritage Arcade Shop', 'Retail shop with strong pedestrian traffic and excellent visibility for daily trade.', 'Delhi', 'Connaught Place', 750, 0, 1, 'unfurnished', 2018, 'rent', 175000, 'available');

INSERT INTO deals (
  deal_id,
  property_id,
  client_id,
  deal_type,
  deal_status,
  agreed_price,
  commission_rate_pct,
  commission_amount,
  deal_date
)
VALUES
  (1, 1, 1, 'sale', 'closed', 12800000, 2.00, 256000, '2026-03-18T10:15:00Z'),
  (2, 6, 6, 'sale', 'closed', 17400000, 2.00, 348000, '2026-03-22T12:30:00Z'),
  (3, 8, 2, 'sale', 'closed', 41200000, 2.00, 824000, '2026-03-25T09:20:00Z'),
  (4, 12, 8, 'sale', 'closed', 14200000, 2.00, 284000, '2026-03-27T16:40:00Z'),
  (5, 20, 11, 'sale', 'pending', 17800000, 2.00, 0, '2026-03-28T11:05:00Z'),
  (6, 17, 7, 'sale', 'closed', 6800000, 2.00, 136000, '2026-04-01T08:50:00Z'),
  (7, 31, 10, 'rent', 'closed', 42000, 1.50, 630, '2026-04-02T13:15:00Z'),
  (8, 35, 4, 'rent', 'pending', 54000, 1.50, 0, '2026-04-04T15:45:00Z');

INSERT INTO payments (
  payment_id,
  deal_id,
  amount,
  method,
  status,
  transaction_ref,
  paid_at
)
VALUES
  (1, 1, 12800000, 'bank_transfer', 'completed', 'EF-PAY-260318-01', '2026-03-18T10:42:00Z'),
  (2, 2, 17400000, 'upi', 'completed', 'EF-PAY-260322-02', '2026-03-22T12:58:00Z'),
  (3, 3, 41200000, 'bank_transfer', 'completed', 'EF-PAY-260325-03', '2026-03-25T09:58:00Z'),
  (4, 4, 14200000, 'cheque', 'completed', 'EF-PAY-260327-04', '2026-03-27T17:10:00Z'),
  (5, 5, 17800000, 'bank_transfer', 'pending', 'EF-PAY-260328-05', NULL),
  (6, 6, 6800000, 'upi', 'completed', 'EF-PAY-260401-06', '2026-04-01T09:12:00Z'),
  (7, 7, 42000, 'upi', 'completed', 'EF-PAY-260402-07', '2026-04-02T13:30:00Z'),
  (8, 8, 54000, 'bank_transfer', 'pending', 'EF-PAY-260404-08', NULL);

INSERT INTO commission_logs (
  log_id,
  deal_id,
  agent_id,
  commission_amount,
  reason
)
VALUES
  (1, 1, 1, 256000, 'Closed sale'),
  (2, 2, 6, 348000, 'Closed sale'),
  (3, 3, 5, 824000, 'Closed sale'),
  (4, 4, 4, 284000, 'Closed sale'),
  (6, 6, 1, 136000, 'Closed sale'),
  (7, 7, 2, 630, 'Closed rental');

SELECT setval('property_categories_category_id_seq', COALESCE((SELECT MAX(category_id) FROM property_categories), 1), true);
SELECT setval('agents_agent_id_seq', COALESCE((SELECT MAX(agent_id) FROM agents), 1), true);
SELECT setval('clients_client_id_seq', COALESCE((SELECT MAX(client_id) FROM clients), 1), true);
SELECT setval('properties_property_id_seq', COALESCE((SELECT MAX(property_id) FROM properties), 1), true);
SELECT setval('deals_deal_id_seq', COALESCE((SELECT MAX(deal_id) FROM deals), 1), true);
SELECT setval('payments_payment_id_seq', COALESCE((SELECT MAX(payment_id) FROM payments), 1), true);
SELECT setval('commission_logs_log_id_seq', COALESCE((SELECT MAX(log_id) FROM commission_logs), 1), true);

COMMIT;