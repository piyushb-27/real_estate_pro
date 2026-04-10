-- Demo seed: categories + agents + properties only
-- Purpose: test inventory/listing flows without deals or payments
-- Run in Supabase SQL Editor

BEGIN;

-- Keep deal/payment side empty for focused testing
TRUNCATE TABLE
  commission_logs,
  payments,
  deals,
  properties,
  agents,
  property_categories
RESTART IDENTITY CASCADE;

-- Optional: keep clients table empty too for strict isolation
TRUNCATE TABLE clients RESTART IDENTITY CASCADE;

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
  (1, 'Aarav', 'Sharma', 'aarav.sharma@urbannest.in', '+91-9000000001', 'UrbanNest Realty', 6),
  (2, 'Isha', 'Mehta', 'isha.mehta@urbannest.in', '+91-9000000002', 'UrbanNest Realty', 4),
  (3, 'Rohan', 'Verma', 'rohan.verma@primekeys.in', '+91-9000000003', 'PrimeKeys', 8),
  (4, 'Neha', 'Kapoor', 'neha.kapoor@primekeys.in', '+91-9000000004', 'PrimeKeys', 5),
  (5, 'Kabir', 'Singh', 'kabir.singh@skylinehomes.in', '+91-9000000005', 'Skyline Homes', 7),
  (6, 'Mira', 'Nair', 'mira.nair@skylinehomes.in', '+91-9000000006', 'Skyline Homes', 3);

INSERT INTO properties (
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
  (1, 1, 'Rakesh Gupta', 'Sunrise Heights 3BHK', 'Bright apartment with balcony and metro access.', 'Bengaluru', 'Whitefield', 1540, 3, 3, 'semi-furnished', 2019, 'sale', 12800000, 'available'),
  (2, 5, 'Pooja Batra', 'Palm Grove Villa', 'Corner villa in gated community with private garden.', 'Hyderabad', 'Gachibowli', 3200, 4, 4, 'furnished', 2021, 'sale', 28500000, 'available'),
  (3, 3, 'Arvind Rao', 'Classic Family House', 'Independent house near school district.', 'Pune', 'Kothrud', 2100, 3, 3, 'semi-furnished', 2016, 'sale', 17500000, 'available'),
  (4, 4, 'Mahesh Iyer', 'Orbit Tech Park Suite', 'Commercial office with conference rooms and reception.', 'Bengaluru', 'Outer Ring Road', 4800, 0, 2, 'furnished', 2020, 'rent', 420000, 'available'),
  (5, 2, 'Sana Khan', 'City Corner Retail Shop', 'Ground-floor retail space in high-footfall market.', 'Mumbai', 'Andheri West', 820, 0, 1, 'unfurnished', 2017, 'rent', 165000, 'available'),
  (6, 6, 'Devansh Malhotra', 'Greenfields Plot 2400', 'Residential corner plot with clear title.', 'Jaipur', 'Jagatpura', 2400, 0, 0, 'unfurnished', 0, 'sale', 6800000, 'available'),
  (1, 2, 'Nitin Agarwal', 'Lakeview Residency 2BHK', 'Well-ventilated apartment with clubhouse access.', 'Pune', 'Hinjewadi', 1180, 2, 2, 'semi-furnished', 2018, 'sale', 8900000, 'available'),
  (1, 1, 'Kiran Desai', 'Metroline Towers 1BHK', 'Compact apartment ideal for young professionals.', 'Delhi', 'Dwarka', 760, 1, 1, 'furnished', 2022, 'rent', 42000, 'available'),
  (2, 5, 'Bhavna Sethi', 'Royal Crest Villa', 'Premium villa with terrace lounge and parking for 3 cars.', 'Mumbai', 'Powai', 3650, 5, 5, 'furnished', 2020, 'sale', 41200000, 'available'),
  (6, 3, 'Rohit Bansal', 'North Avenue Plot 1800', 'East-facing land parcel suitable for duplex build.', 'Lucknow', 'Gomti Nagar', 1800, 0, 0, 'unfurnished', 0, 'sale', 3900000, 'available'),
  (4, 4, 'Harish Patel', 'Infinitum Business Hub', 'Plug-and-play office with cafeteria floor access.', 'Hyderabad', 'HITEC City', 5250, 0, 3, 'furnished', 2019, 'rent', 510000, 'available'),
  (3, 6, 'Anjali Menon', 'Maple Independent Home', 'Quiet neighborhood house with backyard and storage.', 'Kochi', 'Panampilly Nagar', 2350, 4, 3, 'semi-furnished', 2015, 'sale', 14600000, 'available');

COMMIT;
