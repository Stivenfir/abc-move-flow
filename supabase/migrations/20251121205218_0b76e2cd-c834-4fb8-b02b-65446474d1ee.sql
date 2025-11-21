-- Agregar tipo de operación a mudanzas
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_operacion') THEN
    CREATE TYPE tipo_operacion AS ENUM ('exportacion', 'importacion');
  END IF;
END $$;

ALTER TABLE mudanzas 
ADD COLUMN IF NOT EXISTS tipo_operacion tipo_operacion DEFAULT 'exportacion';

-- Agregar más estados específicos al flujo
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'cotizacion_enviada';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'cotizacion_aceptada';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'programacion_empaque';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'booking_solicitado';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'booking_confirmado';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'traslado_puerto';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'exportacion_completa';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'en_transito_internacional';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'arribado_puerto';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'en_proceso_aduanas';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'levante_aprobado';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'programando_entrega';
ALTER TYPE estado_mudanza ADD VALUE IF NOT EXISTS 'contenedor_devuelto';

-- Tabla de booking para exportaciones
CREATE TABLE IF NOT EXISTS booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES mudanzas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'solicitado',
  booking_number TEXT,
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_confirmacion TIMESTAMP WITH TIME ZONE,
  cutoff_fisico TIMESTAMP WITH TIME ZONE,
  cutoff_documental TIMESTAMP WITH TIME ZONE,
  terminal TEXT,
  naviera TEXT,
  tipo_contenedor TEXT,
  bl_number TEXT,
  dex_number TEXT,
  shipping_instructions_url TEXT,
  bl_draft_url TEXT,
  bl_final_url TEXT,
  certificados_url TEXT[],
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_mudanza ON booking(mudanza_id);

-- Tabla de aduanas para importaciones
CREATE TABLE IF NOT EXISTS aduanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES mudanzas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'documentos_pendientes',
  tipo_servicio TEXT NOT NULL,
  bl_number TEXT,
  awb_number TEXT,
  arrival_notice_url TEXT,
  fecha_arribo TIMESTAMP WITH TIME ZONE,
  fecha_limite_levante DATE,
  fecha_levante_real TIMESTAMP WITH TIME ZONE,
  numero_declaracion TEXT,
  fecha_inspeccion TIMESTAMP WITH TIME ZONE,
  tiene_inspeccion BOOLEAN DEFAULT false,
  resultado_inspeccion TEXT,
  documentos_completos BOOLEAN DEFAULT false,
  levante_aprobado BOOLEAN DEFAULT false,
  levante_con_novedad BOOLEAN DEFAULT false,
  descripcion_novedad TEXT,
  factura_flete_url TEXT,
  documentos_dian_url TEXT[],
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aduanas_mudanza ON aduanas(mudanza_id);

-- Tabla de contenedores para importaciones
CREATE TABLE IF NOT EXISTS contenedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES mudanzas(id) ON DELETE CASCADE,
  numero_contenedor TEXT NOT NULL,
  tipo TEXT,
  naviera TEXT,
  fecha_arribo TIMESTAMP WITH TIME ZONE,
  fecha_limite_devolucion DATE NOT NULL,
  fecha_devolucion_real TIMESTAMP WITH TIME ZONE,
  lugar_devolucion TEXT,
  dias_libres INTEGER DEFAULT 0,
  costo_demurrage NUMERIC(10,2),
  costo_detention NUMERIC(10,2),
  estado TEXT NOT NULL DEFAULT 'en_puerto',
  alertas_activas BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contenedores_mudanza ON contenedores(mudanza_id);

-- Tabla de checklist de aduanas
CREATE TABLE IF NOT EXISTS aduanas_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aduanas_id UUID NOT NULL REFERENCES aduanas(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completado BOOLEAN DEFAULT false,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  responsable TEXT,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_aduanas ON aduanas_checklist(aduanas_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_booking_updated_at ON booking;
CREATE TRIGGER update_booking_updated_at
  BEFORE UPDATE ON booking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_aduanas_updated_at ON aduanas;
CREATE TRIGGER update_aduanas_updated_at
  BEFORE UPDATE ON aduanas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contenedores_updated_at ON contenedores;
CREATE TRIGGER update_contenedores_updated_at
  BEFORE UPDATE ON contenedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies para booking
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a booking (temporal)"
  ON booking FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies para aduanas
ALTER TABLE aduanas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a aduanas (temporal)"
  ON aduanas FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies para contenedores
ALTER TABLE contenedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a contenedores (temporal)"
  ON contenedores FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies para aduanas_checklist
ALTER TABLE aduanas_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a aduanas_checklist (temporal)"
  ON aduanas_checklist FOR ALL
  USING (true)
  WITH CHECK (true);