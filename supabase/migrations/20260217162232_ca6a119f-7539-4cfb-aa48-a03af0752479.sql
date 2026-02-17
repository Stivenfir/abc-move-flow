
-- Temporarily allow null remitente_id for seed data (system messages)
ALTER TABLE comunicaciones ALTER COLUMN remitente_id DROP NOT NULL;
