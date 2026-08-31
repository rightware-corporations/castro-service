INSERT INTO permissions (id, code)
SELECT gen_random_uuid(), 'report.read'
ON CONFLICT (code) DO NOTHING;
