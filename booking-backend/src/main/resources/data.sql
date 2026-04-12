-- Drop NOT NULL constraint on available_time if it exists (idempotent)
ALTER TABLE IF EXISTS provider_profile ALTER COLUMN available_time DROP NOT NULL;
