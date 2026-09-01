ALTER TABLE users ADD CONSTRAINT users_organization_id_id_uk UNIQUE (organization_id, id);
ALTER TABLE roles ADD CONSTRAINT roles_organization_id_id_uk UNIQUE (organization_id, id);

ALTER TABLE organization_members
    ADD CONSTRAINT organization_members_user_org_fk
    FOREIGN KEY (organization_id, user_id)
    REFERENCES users(organization_id, id);

ALTER TABLE organization_members
    ADD CONSTRAINT organization_members_role_org_fk
    FOREIGN KEY (organization_id, role_id)
    REFERENCES roles(organization_id, id);
