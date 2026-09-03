ALTER TABLE organization_members
    ADD COLUMN experience_type varchar(30) NOT NULL DEFAULT 'OPERATIONS';

ALTER TABLE organization_members
    ADD CONSTRAINT organization_members_experience_type_check
    CHECK (experience_type IN ('OPERATIONS', 'OWNER'));

-- The one-time bootstrap account is the organization owner/admin by design.
UPDATE organization_members om
SET experience_type = 'OWNER'
FROM roles r
WHERE r.id = om.role_id
  AND r.organization_id = om.organization_id
  AND r.name = 'Bootstrap Administrator';

CREATE INDEX idx_organization_members_org_experience
    ON organization_members(organization_id, experience_type);
