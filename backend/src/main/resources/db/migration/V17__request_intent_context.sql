ALTER TABLE requests ADD COLUMN source_type varchar(40);
ALTER TABLE requests ADD COLUMN source_entity_id uuid;
ALTER TABLE requests ADD COLUMN source_entity_slug varchar(220);
ALTER TABLE requests ADD COLUMN source_entity_name varchar(200);
ALTER TABLE requests ADD COLUMN source_cta varchar(80);
ALTER TABLE requests ADD COLUMN source_path varchar(500);
ALTER TABLE requests ADD COLUMN entry_path varchar(500);
ALTER TABLE requests ADD COLUMN referrer text;
ALTER TABLE requests ADD COLUMN utm_source varchar(200);
ALTER TABLE requests ADD COLUMN utm_medium varchar(200);
ALTER TABLE requests ADD COLUMN utm_campaign varchar(200);

CREATE INDEX idx_requests_org_source ON requests(organization_id, source_type, source_entity_id);
