-- Hacer coordinador_id nullable temporalmente para desarrollo sin auth
ALTER TABLE mudanzas 
ALTER COLUMN coordinador_id DROP NOT NULL;

-- Actualizar mudanzas existentes para no requerir coordinador
UPDATE mudanzas 
SET coordinador_id = NULL
WHERE coordinador_id = '00000000-0000-0000-0000-000000000000';