-- Extender tabla agentes con campos adicionales
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS network text CHECK (network IN ('Harmony', 'FIDI', 'LACMA'));
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'trial', 'paused', 'blocked'));
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS time_zone text;
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD';
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS doc_preferences jsonb DEFAULT '{}';
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS lane_strengths jsonb DEFAULT '[]';
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS assignment_rules jsonb DEFAULT '{}';
ALTER TABLE public.agentes ADD COLUMN IF NOT EXISTS internal_notes text;

-- Crear tabla AgentStats (estadísticas agregadas por periodo)
CREATE TABLE IF NOT EXISTS public.agent_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  period date NOT NULL,
  bookings integer DEFAULT 0,
  m3_total numeric DEFAULT 0,
  on_time_pct numeric DEFAULT 0,
  doc_ok_pct numeric DEFAULT 0,
  nps_avg numeric DEFAULT 0,
  claims_per_100 numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  gross_margin numeric DEFAULT 0,
  sent_services integer DEFAULT 0,
  received_services integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, period)
);

ALTER TABLE public.agent_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver stats de agentes"
ON public.agent_stats FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins y coordinadores pueden gestionar stats"
ON public.agent_stats FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

-- Crear tabla AgentReciprocity (reciprocidad de servicios)
CREATE TABLE IF NOT EXISTS public.agent_reciprocity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  period date NOT NULL,
  sent_services integer DEFAULT 0,
  received_services integer DEFAULT 0,
  reciprocity_ratio numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, period)
);

ALTER TABLE public.agent_reciprocity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver reciprocidad"
ON public.agent_reciprocity FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins y coordinadores pueden gestionar reciprocidad"
ON public.agent_reciprocity FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

-- Crear tabla AgentFinancials (cuentas por cobrar/pagar)
CREATE TABLE IF NOT EXISTS public.agent_financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  period date NOT NULL,
  ar_total numeric DEFAULT 0,
  ap_total numeric DEFAULT 0,
  ar_aging jsonb DEFAULT '{"0-30": 0, "31-60": 0, "61-90": 0, "90+": 0}',
  ap_aging jsonb DEFAULT '{"0-30": 0, "31-60": 0, "61-90": 0, "90+": 0}',
  net_balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(agent_id, period)
);

ALTER TABLE public.agent_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finanzas y admins pueden ver financials de agentes"
ON public.agent_financials FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'finanzas'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

CREATE POLICY "Finanzas puede gestionar financials"
ON public.agent_financials FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'finanzas'::user_role));

-- Crear tabla AgentLane (rutas y SLAs por lane)
CREATE TABLE IF NOT EXISTS public.agent_lanes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  origin_country text NOT NULL,
  origin_city text,
  dest_country text NOT NULL,
  dest_city text,
  mode text CHECK (mode IN ('aereo', 'maritimo', 'terrestre')),
  service_type text,
  sla_targets jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.agent_lanes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver lanes"
ON public.agent_lanes FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins y coordinadores pueden gestionar lanes"
ON public.agent_lanes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

-- Crear tabla ShipmentMove (relación agente-mudanza)
CREATE TABLE IF NOT EXISTS public.shipment_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id uuid NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('origin', 'destination', 'd2d', 'storage', 'uav')),
  on_time_hit boolean DEFAULT true,
  doc_ok boolean DEFAULT true,
  claims_count integer DEFAULT 0,
  revenue_alloc numeric DEFAULT 0,
  cost_alloc numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.shipment_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver shipment moves si puedes ver la mudanza"
ON public.shipment_moves FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.mudanzas 
  WHERE mudanzas.id = shipment_moves.mudanza_id
));

CREATE POLICY "Coordinadores pueden gestionar shipment moves"
ON public.shipment_moves FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

-- Crear tabla AgentCommunication (log de comunicaciones)
CREATE TABLE IF NOT EXISTS public.agent_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  mudanza_id uuid REFERENCES public.mudanzas(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  template_id text,
  recipients text[] NOT NULL,
  cc text[],
  subject text,
  body text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at timestamp with time zone,
  payload_url text,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.agent_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver comunicaciones de agentes"
ON public.agent_communications FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Coordinadores pueden gestionar comunicaciones"
ON public.agent_communications FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

-- Crear tabla AgentStatement (estados de cuenta generados)
CREATE TABLE IF NOT EXISTS public.agent_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agentes(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  file_url text,
  sent_to text[],
  sent_at timestamp with time zone,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent', 'failed')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.agent_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver statements de agentes"
ON public.agent_statements FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'finanzas'::user_role) OR has_role(auth.uid(), 'coordinador'::user_role));

CREATE POLICY "Finanzas puede gestionar statements"
ON public.agent_statements FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'finanzas'::user_role));

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_agent_stats_agent_period ON public.agent_stats(agent_id, period);
CREATE INDEX IF NOT EXISTS idx_agent_reciprocity_agent_period ON public.agent_reciprocity(agent_id, period);
CREATE INDEX IF NOT EXISTS idx_agent_financials_agent_period ON public.agent_financials(agent_id, period);
CREATE INDEX IF NOT EXISTS idx_shipment_moves_mudanza ON public.shipment_moves(mudanza_id);
CREATE INDEX IF NOT EXISTS idx_shipment_moves_agent ON public.shipment_moves(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_communications_agent ON public.agent_communications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_communications_mudanza ON public.agent_communications(mudanza_id);

-- Triggers para updated_at
CREATE TRIGGER update_agent_stats_updated_at
BEFORE UPDATE ON public.agent_stats
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_reciprocity_updated_at
BEFORE UPDATE ON public.agent_reciprocity
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_financials_updated_at
BEFORE UPDATE ON public.agent_financials
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agent_lanes_updated_at
BEFORE UPDATE ON public.agent_lanes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_shipment_moves_updated_at
BEFORE UPDATE ON public.shipment_moves
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();