ALTER TABLE customers
    ADD COLUMN lifecycle_stage varchar(32) NOT NULL DEFAULT 'LEAD';

ALTER TABLE customers
    ADD CONSTRAINT ck_customers_lifecycle_stage
    CHECK (lifecycle_stage IN ('LEAD','QUALIFIED_LEAD','CUSTOMER','RETURNING_CUSTOMER'));

UPDATE customers c
SET lifecycle_stage = 'QUALIFIED_LEAD'
WHERE EXISTS (
    SELECT 1 FROM requests r
    WHERE r.organization_id = c.organization_id
      AND r.customer_id = c.id
      AND r.status = 'QUALIFIED'
);

UPDATE customers c
SET lifecycle_stage = 'CUSTOMER'
WHERE EXISTS (
    SELECT 1 FROM requests r
    WHERE r.organization_id = c.organization_id
      AND r.customer_id = c.id
      AND r.status = 'CONVERTED'
) OR EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.organization_id = c.organization_id
      AND b.customer_id = c.id
      AND b.status IN ('CONFIRMED','COMPLETED')
) OR EXISTS (
    SELECT 1 FROM course_registrations cr
    WHERE cr.organization_id = c.organization_id
      AND cr.customer_id = c.id
      AND cr.status = 'CONFIRMED'
);

CREATE INDEX idx_customers_org_lifecycle
    ON customers(organization_id, lifecycle_stage, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_org_id
    ON users(organization_id, id);

ALTER TABLE requests
    ADD COLUMN owner_user_id uuid,
    ADD COLUMN follow_up_at timestamptz,
    ADD COLUMN last_contact_at timestamptz,
    ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE requests
    ADD CONSTRAINT fk_requests_owner_same_org
    FOREIGN KEY (organization_id, owner_user_id)
    REFERENCES users(organization_id, id);

CREATE INDEX idx_requests_org_follow_up
    ON requests(organization_id, follow_up_at)
    WHERE follow_up_at IS NOT NULL AND status NOT IN ('CLOSED','CANCELLED');

CREATE INDEX idx_requests_org_owner_status
    ON requests(organization_id, owner_user_id, status);
