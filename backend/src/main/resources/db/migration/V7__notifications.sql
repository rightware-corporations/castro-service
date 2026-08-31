CREATE TABLE notifications (
    id uuid PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    recipient_user_id uuid NOT NULL REFERENCES users(id),
    type varchar(80) NOT NULL,
    title varchar(200) NOT NULL,
    body text,
    resource_type varchar(80),
    resource_id uuid,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_created
    ON notifications(organization_id, recipient_user_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_unread
    ON notifications(organization_id, recipient_user_id, read_at)
    WHERE read_at IS NULL;

INSERT INTO permissions (id, code)
SELECT gen_random_uuid(), 'notification.read'
ON CONFLICT (code) DO NOTHING;
