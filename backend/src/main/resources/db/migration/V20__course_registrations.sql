CREATE TABLE course_registrations (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    course_id uuid NOT NULL REFERENCES courses(id),
    course_session_id uuid NOT NULL REFERENCES course_sessions(id),
    customer_id uuid NOT NULL REFERENCES customers(id),
    reference varchar(32) NOT NULL UNIQUE,
    status varchar(30) NOT NULL DEFAULT 'PENDING',
    participant_count integer NOT NULL CHECK (participant_count > 0),
    organization_name varchar(200),
    notes text,
    idempotency_key varchar(255),
    idempotency_fingerprint varchar(64),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_registration_idempotency UNIQUE (organization_id, idempotency_key)
);

CREATE INDEX idx_course_registrations_org_created
    ON course_registrations(organization_id, created_at DESC);
CREATE INDEX idx_course_registrations_session_status
    ON course_registrations(course_session_id, status);
