-- =============================================================================
-- LOCAL DEVELOPMENT FIXTURES — NEVER LOAD INTO PRODUCTION.
-- Sample stores exist only to exercise the Store Locator, filters and counts.
-- Names are prefixed "DEV SAMPLE" and phone numbers are invalid on purpose.
-- Coordinates are generic city-centre points, not real store locations.
-- =============================================================================

insert into public.stores (brand_id, name, address, locality, city, state, pincode, latitude, longitude, phone, store_status)
values
  ('11111111-1111-4111-8111-111111111111', 'DEV SAMPLE — Indiranagar', 'Sample address line, 100 Feet Road', 'Indiranagar', 'Bengaluru', 'Karnataka', '560038', 12.9719, 77.6412, '+91 00000 00001', 'live'),
  ('11111111-1111-4111-8111-111111111111', 'DEV SAMPLE — Koramangala', 'Sample address line, 80 Feet Road', 'Koramangala', 'Bengaluru', 'Karnataka', '560034', 12.9352, 77.6245, '+91 00000 00002', 'live'),
  ('11111111-1111-4111-8111-111111111111', 'DEV SAMPLE — Banjara Hills', 'Sample address line, Road No. 12', 'Banjara Hills', 'Hyderabad', 'Telangana', '500034', 17.4126, 78.4482, '+91 00000 00003', 'live'),
  ('11111111-1111-4111-8111-111111111111', 'DEV SAMPLE — Andheri West', 'Sample address line, Link Road', 'Andheri West', 'Mumbai', 'Maharashtra', '400053', 19.1364, 72.8296, '+91 00000 00004', 'opening_soon'),
  ('22222222-2222-4222-8222-222222222222', 'DEV SAMPLE — Jayanagar', 'Sample address line, 4th Block', 'Jayanagar', 'Bengaluru', 'Karnataka', '560011', 12.9299, 77.5826, '+91 00000 00005', 'live'),
  ('22222222-2222-4222-8222-222222222222', 'DEV SAMPLE — Anna Nagar', 'Sample address line, 2nd Avenue', 'Anna Nagar', 'Chennai', 'Tamil Nadu', '600040', 13.0850, 80.2101, '+91 00000 00006', 'live'),
  ('22222222-2222-4222-8222-222222222222', 'DEV SAMPLE — Kothrud', 'Sample address line, Karve Road', 'Kothrud', 'Pune', 'Maharashtra', '411038', 18.5074, 73.8077, '+91 00000 00007', 'live'),
  ('33333333-3333-4333-8333-333333333333', 'DEV SAMPLE — HSR Layout', 'Sample address line, 27th Main', 'HSR Layout', 'Bengaluru', 'Karnataka', '560102', 12.9116, 77.6474, '+91 00000 00008', 'live'),
  ('33333333-3333-4333-8333-333333333333', 'DEV SAMPLE — Kakkanad', 'Sample address line, Infopark Road', 'Kakkanad', 'Kochi', 'Kerala', '682030', 10.0159, 76.3419, '+91 00000 00009', 'live'),
  ('33333333-3333-4333-8333-333333333333', 'DEV SAMPLE — Salt Lake', 'Sample address line, Sector V', 'Salt Lake', 'Kolkata', 'West Bengal', '700091', 22.5726, 88.4339, '+91 00000 00010', 'live'),
  ('33333333-3333-4333-8333-333333333333', 'DEV SAMPLE — Sector 29', 'Sample address line, Leisure Valley', 'Sector 29', 'Gurugram', 'Haryana', '122001', 28.4683, 77.0645, '+91 00000 00011', 'live');

insert into public.store_hours (store_id, day_of_week, opens_at, closes_at)
select s.id, d, '11:00', '23:00' from public.stores s cross join generate_series(0, 6) as d;

insert into public.store_order_links (store_id, platform, url, sort_order)
select s.id, p.platform, 'https://example.com/order', p.ord
from public.stores s
cross join (values ('Swiggy', 1), ('Zomato', 2)) as p(platform, ord)
where s.store_status = 'live';

insert into public.people (kind, name, designation, background, responsibility, sort_order, status) values
  ('founder', 'Founder name', '[CLIENT CONTENT REQUIRED] Designation', '[CLIENT CONTENT REQUIRED] Professional background', '[CLIENT CONTENT REQUIRED] Responsibility', 1, 'published'),
  ('founder', 'Co-founder name', '[CLIENT CONTENT REQUIRED] Designation', '[CLIENT CONTENT REQUIRED] Professional background', '[CLIENT CONTENT REQUIRED] Responsibility', 2, 'published');

insert into public.milestones (year_label, title, body, sort_order) values
  ('Year', '[CLIENT CONTENT REQUIRED] Incorporation', '[CLIENT CONTENT REQUIRED]', 1),
  ('Year', '[CLIENT CONTENT REQUIRED] First store', '[CLIENT CONTENT REQUIRED]', 2),
  ('Year', '[CLIENT CONTENT REQUIRED] Brand launch', '[CLIENT CONTENT REQUIRED]', 3);

insert into public.jobs (title, brand_id, location, employment_type, summary, description, requirements, status) values
  ('DEV SAMPLE — Store Manager', '11111111-1111-4111-8111-111111111111', 'Bengaluru', 'Full-time',
   'Sample role used to test the careers flow.', 'Sample description.', 'Sample requirements.', 'published');
