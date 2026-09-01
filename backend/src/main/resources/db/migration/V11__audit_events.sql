create table audit_events (
    id uuid primary key,
    organization_id uuid not null references organizations(id),
    actor_user_id uuid references users(id),
    action varchar(80) not null,
    entity_type varchar(80) not null,
    entity_id uuid,
    details text,
    created_at timestamptz not null
);

create index idx_audit_events_org_created on audit_events(organization_id, created_at desc);
create index idx_audit_events_org_entity on audit_events(organization_id, entity_type, entity_id);
