ALTER TABLE space_layouts ALTER COLUMN name TYPE varchar(200);
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS capacity int;
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS created_at timestamptz;
ALTER TABLE space_layouts ADD COLUMN IF NOT EXISTS updated_at timestamptz;
UPDATE space_layouts SET created_at = COALESCE(created_at, now()), updated_at = COALESCE(updated_at, now());
ALTER TABLE space_layouts ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE space_layouts ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE space_layouts DROP CONSTRAINT IF EXISTS space_layouts_capacity_check;
ALTER TABLE space_layouts ADD CONSTRAINT space_layouts_capacity_check CHECK (capacity IS NULL OR capacity >= 0);
CREATE INDEX IF NOT EXISTS idx_space_layouts_space_active ON space_layouts(space_id, active, sort_order);

CREATE TABLE IF NOT EXISTS space_resources (
    id uuid PRIMARY KEY,
    space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    description text,
    quantity int,
    active boolean NOT NULL DEFAULT true,
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CHECK (quantity IS NULL OR quantity >= 0),
    UNIQUE(space_id, name)
);

CREATE INDEX IF NOT EXISTS idx_space_resources_space_active ON space_resources(space_id, active, sort_order);
