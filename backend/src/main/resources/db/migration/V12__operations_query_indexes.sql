create index if not exists idx_requests_org_created on requests(organization_id, created_at desc);
create index if not exists idx_bookings_org_start on bookings(organization_id, start_at desc);
create index if not exists idx_customers_org_updated on customers(organization_id, updated_at desc);
create index if not exists idx_requests_org_status_created on requests(organization_id, status, created_at desc);
create index if not exists idx_bookings_org_status_start on bookings(organization_id, status, start_at desc);
