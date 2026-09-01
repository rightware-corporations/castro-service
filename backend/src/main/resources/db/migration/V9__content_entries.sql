ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS title varchar(240);
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS body text;
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- V2 contained a legacy required `value` field. The structured content model no longer writes it.
ALTER TABLE content_entries ALTER COLUMN value DROP NOT NULL;

ALTER TABLE content_entries DROP CONSTRAINT IF EXISTS content_entries_status_chk;
ALTER TABLE content_entries ADD CONSTRAINT content_entries_status_chk CHECK (status in ('DRAFT','PUBLISHED'));
CREATE INDEX IF NOT EXISTS content_entries_org_status_idx ON content_entries(organization_id, status, updated_at desc);
