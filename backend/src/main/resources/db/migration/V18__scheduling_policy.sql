ALTER TABLE services
    ADD COLUMN confirmation_mode varchar(20) NOT NULL DEFAULT 'MANUAL',
    ADD CONSTRAINT chk_services_confirmation_mode CHECK (confirmation_mode IN ('MANUAL','AUTOMATIC'));

ALTER TABLE spaces
    ADD COLUMN booking_enabled boolean NOT NULL DEFAULT true,
    ADD COLUMN confirmation_mode varchar(20) NOT NULL DEFAULT 'MANUAL',
    ADD CONSTRAINT chk_spaces_confirmation_mode CHECK (confirmation_mode IN ('MANUAL','AUTOMATIC'));
