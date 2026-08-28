ALTER TABLE bookings ADD COLUMN idempotency_key varchar(255), ADD COLUMN idempotency_fingerprint varchar(64);
CREATE UNIQUE INDEX uq_bookings_org_idempotency ON bookings(organization_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
ALTER TABLE requests ADD COLUMN idempotency_key varchar(255), ADD COLUMN idempotency_fingerprint varchar(64);
CREATE UNIQUE INDEX uq_requests_org_idempotency ON requests(organization_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
