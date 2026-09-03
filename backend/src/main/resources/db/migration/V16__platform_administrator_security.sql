create table platform_administrators (
    id uuid primary key,
    email varchar(320) not null,
    password_hash varchar(255) not null,
    first_name varchar(120) not null,
    last_name varchar(120) not null,
    active boolean not null default true,
    created_at timestamptz not null,
    last_login_at timestamptz
);

create unique index uq_platform_administrators_email_ci
    on platform_administrators (lower(email));

create table platform_audit_events (
    id uuid primary key,
    actor_platform_admin_id uuid references platform_administrators(id),
    action varchar(80) not null,
    entity_type varchar(80) not null,
    entity_id uuid,
    details text,
    created_at timestamptz not null
);

create index idx_platform_audit_events_created
    on platform_audit_events (created_at desc);

create index idx_platform_audit_events_actor_created
    on platform_audit_events (actor_platform_admin_id, created_at desc);
