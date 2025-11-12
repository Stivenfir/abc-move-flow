-- Tabla de eventos y auditoría
CREATE TABLE IF NOT EXISTS public.mudanza_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'estado_cambio', 'documento_generado', 'hito_completado', 'comunicacion', 'alerta', 'nota'
  categoria TEXT NOT NULL, -- 'sistema', 'usuario', 'automatico'
  descripcion TEXT NOT NULL,
  datos_previos JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  usuario_nombre TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_mudanza_eventos_mudanza ON public.mudanza_eventos(mudanza_id, created_at DESC);
CREATE INDEX idx_mudanza_eventos_tipo ON public.mudanza_eventos(tipo);
CREATE INDEX idx_mudanza_eventos_usuario ON public.mudanza_eventos(usuario_id);

-- RLS Policies
ALTER TABLE public.mudanza_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver eventos si puedes ver la mudanza"
ON public.mudanza_eventos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.mudanzas
    WHERE mudanzas.id = mudanza_eventos.mudanza_id
  )
);

CREATE POLICY "Coordinadores pueden insertar eventos"
ON public.mudanza_eventos FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'coordinador'::user_role)
);

-- Tabla de alertas inteligentes
CREATE TABLE IF NOT EXISTS public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'sla_vencido', 'documento_pendiente', 'fecha_proxima', 'reciprocidad', 'costo_excedido'
  severidad TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB,
  leida BOOLEAN DEFAULT FALSE,
  resuelta BOOLEAN DEFAULT FALSE,
  asignado_a UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resuelta_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_alertas_mudanza ON public.alertas(mudanza_id, created_at DESC);
CREATE INDEX idx_alertas_asignado ON public.alertas(asignado_a, resuelta);
CREATE INDEX idx_alertas_severidad ON public.alertas(severidad, resuelta);

-- RLS Policies
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver alertas asignadas o de mudanzas visibles"
ON public.alertas FOR SELECT
USING (
  asignado_a = auth.uid() OR
  has_role(auth.uid(), 'admin'::user_role) OR
  has_role(auth.uid(), 'coordinador'::user_role)
);

CREATE POLICY "Coordinadores pueden gestionar alertas"
ON public.alertas FOR ALL
USING (
  has_role(auth.uid(), 'admin'::user_role) OR 
  has_role(auth.uid(), 'coordinador'::user_role)
);

-- Función para registrar eventos automáticamente
CREATE OR REPLACE FUNCTION public.registrar_evento_mudanza()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_nombre TEXT;
BEGIN
  -- Obtener nombre del usuario si existe
  IF auth.uid() IS NOT NULL THEN
    SELECT nombre_completo INTO v_usuario_nombre
    FROM public.profiles
    WHERE id = auth.uid();
  END IF;

  -- Registrar cambio de estado
  IF TG_OP = 'UPDATE' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.mudanza_eventos (
      mudanza_id,
      tipo,
      categoria,
      descripcion,
      datos_previos,
      datos_nuevos,
      usuario_id,
      usuario_nombre
    ) VALUES (
      NEW.id,
      'estado_cambio',
      'usuario',
      'Estado cambiado de ' || OLD.estado || ' a ' || NEW.estado,
      jsonb_build_object('estado', OLD.estado, 'progreso', OLD.progreso),
      jsonb_build_object('estado', NEW.estado, 'progreso', NEW.progreso),
      auth.uid(),
      v_usuario_nombre
    );
  END IF;

  -- Registrar cambio de prioridad
  IF TG_OP = 'UPDATE' AND OLD.prioridad IS DISTINCT FROM NEW.prioridad THEN
    INSERT INTO public.mudanza_eventos (
      mudanza_id,
      tipo,
      categoria,
      descripcion,
      datos_previos,
      datos_nuevos,
      usuario_id,
      usuario_nombre
    ) VALUES (
      NEW.id,
      'prioridad_cambio',
      'usuario',
      'Prioridad cambiada de ' || OLD.prioridad || ' a ' || NEW.prioridad,
      jsonb_build_object('prioridad', OLD.prioridad),
      jsonb_build_object('prioridad', NEW.prioridad),
      auth.uid(),
      v_usuario_nombre
    );
  END IF;

  -- Registrar asignación de agente
  IF TG_OP = 'UPDATE' AND OLD.agente_id IS DISTINCT FROM NEW.agente_id THEN
    INSERT INTO public.mudanza_eventos (
      mudanza_id,
      tipo,
      categoria,
      descripcion,
      datos_previos,
      datos_nuevos,
      usuario_id,
      usuario_nombre
    ) VALUES (
      NEW.id,
      'agente_asignado',
      'usuario',
      CASE 
        WHEN NEW.agente_id IS NULL THEN 'Agente removido'
        ELSE 'Agente internacional asignado'
      END,
      jsonb_build_object('agente_id', OLD.agente_id),
      jsonb_build_object('agente_id', NEW.agente_id),
      auth.uid(),
      v_usuario_nombre
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para mudanzas
DROP TRIGGER IF EXISTS trigger_mudanza_eventos ON public.mudanzas;
CREATE TRIGGER trigger_mudanza_eventos
  AFTER UPDATE ON public.mudanzas
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_evento_mudanza();

-- Función para generar alertas automáticas
CREATE OR REPLACE FUNCTION public.generar_alertas_sla()
RETURNS void AS $$
DECLARE
  v_hito RECORD;
  v_mudanza RECORD;
BEGIN
  -- Alertas por hitos vencidos o próximos a vencer
  FOR v_hito IN 
    SELECT h.*, m.numero, m.coordinador_id
    FROM public.hitos h
    JOIN public.mudanzas m ON m.id = h.mudanza_id
    WHERE h.completado = FALSE
      AND h.fecha_plan IS NOT NULL
  LOOP
    -- Hito vencido
    IF v_hito.fecha_plan < CURRENT_DATE AND NOT EXISTS (
      SELECT 1 FROM public.alertas 
      WHERE mudanza_id = v_hito.mudanza_id 
        AND tipo = 'sla_vencido'
        AND datos->>'hito_id' = v_hito.id::text
        AND resuelta = FALSE
    ) THEN
      INSERT INTO public.alertas (
        mudanza_id,
        tipo,
        severidad,
        titulo,
        mensaje,
        datos,
        asignado_a
      ) VALUES (
        v_hito.mudanza_id,
        'sla_vencido',
        'error',
        'SLA Vencido: ' || v_hito.estado,
        'La etapa ' || v_hito.estado || ' de la mudanza ' || v_hito.numero || ' está vencida por ' || 
        (CURRENT_DATE - v_hito.fecha_plan) || ' días',
        jsonb_build_object(
          'hito_id', v_hito.id,
          'estado', v_hito.estado,
          'dias_vencido', CURRENT_DATE - v_hito.fecha_plan
        ),
        v_hito.coordinador_id
      );
    END IF;

    -- Hito próximo a vencer (2 días o menos)
    IF v_hito.fecha_plan BETWEEN CURRENT_DATE AND CURRENT_DATE + 2 
      AND NOT EXISTS (
        SELECT 1 FROM public.alertas 
        WHERE mudanza_id = v_hito.mudanza_id 
          AND tipo = 'fecha_proxima'
          AND datos->>'hito_id' = v_hito.id::text
          AND resuelta = FALSE
          AND created_at > CURRENT_DATE - 1
      ) THEN
      INSERT INTO public.alertas (
        mudanza_id,
        tipo,
        severidad,
        titulo,
        mensaje,
        datos,
        asignado_a
      ) VALUES (
        v_hito.mudanza_id,
        'fecha_proxima',
        'warning',
        'SLA Por Vencer: ' || v_hito.estado,
        'La etapa ' || v_hito.estado || ' de la mudanza ' || v_hito.numero || ' vence en ' || 
        (v_hito.fecha_plan - CURRENT_DATE) || ' días',
        jsonb_build_object(
          'hito_id', v_hito.id,
          'estado', v_hito.estado,
          'dias_restantes', v_hito.fecha_plan - CURRENT_DATE
        ),
        v_hito.coordinador_id
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;