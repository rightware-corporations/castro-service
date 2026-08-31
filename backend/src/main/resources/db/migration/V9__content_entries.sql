create table content_entries (
    id uuid primary key,
    organization_id uuid not null references organizations(id) on delete cascade,
    content_key varchar(160) not null,
    title varchar(240),
    body text,
    media_url text,
    status varchar(20) not null default 'DRAFT',
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint content_entries_status_chk check (status in ('DRAFT','PUBLISHED')),
    constraint content_entries_org_key_uk unique (organization_id, content_key)
);

create index content_entries_org_status_idx on content_entries(organization_id, status, updated_at desc);
