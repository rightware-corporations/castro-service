CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO permissions (id, code)
SELECT gen_random_uuid(), code
FROM (VALUES
  ('dashboard.read'),
  ('customer.read'), ('customer.create'), ('customer.update'), ('customer.delete'),
  ('request.read'), ('request.create'), ('request.update'), ('request.assign'), ('request.close'),
  ('booking.read'), ('booking.create'), ('booking.update'), ('booking.cancel'),
  ('service.read'), ('service.manage'),
  ('course.read'), ('course.manage'),
  ('space.read'), ('space.manage'),
  ('availability.read'), ('availability.manage'),
  ('content.read'), ('content.manage'),
  ('user.read'), ('user.manage'),
  ('role.read'), ('role.manage'),
  ('permission.read'), ('permission.manage'),
  ('settings.read'), ('settings.manage'),
  ('audit.read')
) AS catalog(code)
ON CONFLICT (code) DO NOTHING;
