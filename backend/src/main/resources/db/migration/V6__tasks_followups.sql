INSERT INTO permissions (id, code)
SELECT gen_random_uuid(), code
FROM (VALUES ('task.read'), ('task.manage')) AS catalog(code)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(16) NOT NULL DEFAULT 'NORMAL',
  due_at TIMESTAMPTZ,
  assigned_user_id UUID REFERENCES users(id),
  request_id UUID REFERENCES requests(id),
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_tasks_status CHECK (status IN ('OPEN','IN_PROGRESS','DONE','CANCELLED')),
  CONSTRAINT ck_tasks_priority CHECK (priority IN ('LOW','NORMAL','HIGH','URGENT'))
);

CREATE INDEX idx_tasks_org_status_due ON tasks(organization_id, status, due_at);
CREATE INDEX idx_tasks_assigned_user ON tasks(organization_id, assigned_user_id);
