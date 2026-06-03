INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Avery Admin', 'admin@crm.local', '$2a$10$SeGl2ESGw3F9cZO3qvXvJepJIW1pm5GSizhrXjdbTIGd/9NfuL.yW', 'admin'),
  ('Maya Manager', 'manager@crm.local', '$2a$10$SeGl2ESGw3F9cZO3qvXvJepJIW1pm5GSizhrXjdbTIGd/9NfuL.yW', 'manager'),
  ('Sam Sales', 'sales@crm.local', '$2a$10$SeGl2ESGw3F9cZO3qvXvJepJIW1pm5GSizhrXjdbTIGd/9NfuL.yW', 'sales'),
  ('Riley Support', 'support@crm.local', '$2a$10$SeGl2ESGw3F9cZO3qvXvJepJIW1pm5GSizhrXjdbTIGd/9NfuL.yW', 'support')
ON CONFLICT (email) DO NOTHING;

WITH owners AS (
  SELECT id, email FROM users WHERE email IN ('manager@crm.local', 'sales@crm.local')
)
INSERT INTO leads (company_name, contact_name, email, phone, source, status, value, owner_id, expected_close_date, notes)
VALUES
  ('Northstar Retail', 'Priya Nair', 'priya@northstar.example', '+91 98765 10001', 'Website', 'qualified', 92000, (SELECT id FROM owners WHERE email = 'sales@crm.local'), CURRENT_DATE + 24, 'Interested in multi-branch rollout.'),
  ('BluePeak Logistics', 'Noah James', 'noah@bluepeak.example', '+1 415 555 0181', 'Referral', 'proposal', 148500, (SELECT id FROM owners WHERE email = 'manager@crm.local'), CURRENT_DATE + 14, 'Needs approval workflow and custom reports.'),
  ('Cedar Finance', 'Anika Rao', 'anika@cedar.example', '+91 98765 10002', 'LinkedIn', 'contacted', 64000, (SELECT id FROM owners WHERE email = 'sales@crm.local'), CURRENT_DATE + 38, 'Follow up after demo.'),
  ('UrbanNest Homes', 'Leo Martin', 'leo@urbannest.example', '+44 20 7946 0101', 'Conference', 'won', 210000, (SELECT id FROM owners WHERE email = 'manager@crm.local'), CURRENT_DATE - 5, 'Closed annual subscription.'),
  ('Helio Health', 'Sara Khan', 'sara@helio.example', '+91 98765 10003', 'Email campaign', 'new', 57000, (SELECT id FROM owners WHERE email = 'sales@crm.local'), CURRENT_DATE + 50, 'Requested pricing sheet.')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, due_date, priority, status, lead_id, assigned_to, created_by)
SELECT 'Send revised proposal', 'Include implementation timeline and support package.', CURRENT_DATE + 2, 'high', 'in_progress', l.id, u.id, m.id
FROM leads l
JOIN users u ON u.email = 'sales@crm.local'
JOIN users m ON m.email = 'manager@crm.local'
WHERE l.company_name = 'BluePeak Logistics'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, due_date, priority, status, lead_id, assigned_to, created_by)
SELECT 'Schedule product demo', 'Book 45-minute workflow demo with operations team.', CURRENT_DATE + 4, 'medium', 'todo', l.id, u.id, m.id
FROM leads l
JOIN users u ON u.email = 'sales@crm.local'
JOIN users m ON m.email = 'manager@crm.local'
WHERE l.company_name = 'Cedar Finance'
ON CONFLICT DO NOTHING;

INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
SELECT u.id, 'seeded', 'system', NULL, '{"message":"Initial CRM data loaded"}'::jsonb
FROM users u
WHERE u.email = 'admin@crm.local'
ON CONFLICT DO NOTHING;
