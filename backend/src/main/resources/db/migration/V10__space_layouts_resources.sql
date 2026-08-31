CREATE TABLE space_layouts (
    id uuid PRIMARY KEY,
    space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    name varchar(200) NOT NULL,
    description text,
    capacity int,
    active boolean NOT NULL DEFAULT true,
    sort_order int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CHECK (capacity IS NULL OR capacity >= 0),
    UNIQUE(space_id, name)
);

CREATE INDEX idx_space_layouts_space_active ON space_layouts(space_id, active, sort_order);

CREATE TABLE space_resources (
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

CREATE INDEX idx_space_resources_space_active ON space_resources(space_id, active, sort_order);
