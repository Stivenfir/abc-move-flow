-- Crear tipo enum para roles
CREATE TYPE public.user_role AS ENUM ('admin', 'coordinador', 'cliente', 'agente', 'finanzas', 'comercial');

-- Crear tipo enum para estados de mudanza
CREATE TYPE public.estado_mudanza AS ENUM (
  'inspeccion',
  'cotizacion',
  'booking',
  'empaque',
  'bodega',
  'despacho',
  'transito',
  'aduana',
  'entrega',
  'cerrado'
);

-- Crear tipo enum para tipos de mudanza
CREATE TYPE public.tipo_mudanza AS ENUM (
  'uav',
  'excess_baggage',
  'diplomatica',
  'corporativa',
  'privada',
  'local',
  'internacional'
);

-- Crear tipo enum para modo de transporte
CREATE TYPE public.modo_transporte AS ENUM ('aereo', 'maritimo', 'terrestre');

-- Crear tipo enum para prioridad
CREATE TYPE public.prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');

-- Crear tipo enum para tipo de cliente
CREATE TYPE public.tipo_cliente AS ENUM ('individual', 'corporativo', 'diplomatico');

-- Crear tipo enum para condición de item
CREATE TYPE public.condicion_item AS ENUM ('excelente', 'buena', 'regular', 'dañado');

-- ======================
-- TABLA DE PERFILES
-- ======================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ======================
-- TABLA DE ROLES DE USUARIO
-- ======================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Políticas para user_roles
CREATE POLICY "Admins pueden ver todos los roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuarios pueden ver sus propios roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ======================
-- TABLA DE CLIENTES
-- ======================
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  tipo public.tipo_cliente NOT NULL DEFAULT 'individual',
  empresa TEXT,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Coordinadores y admins pueden ver todos los clientes"
  ON public.clientes FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador') OR
    public.has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Clientes pueden ver su propia información"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Coordinadores y admins pueden insertar clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador') OR
    public.has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Coordinadores y admins pueden actualizar clientes"
  ON public.clientes FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador') OR
    public.has_role(auth.uid(), 'comercial')
  );

-- ======================
-- TABLA DE AGENTES INTERNACIONALES
-- ======================
CREATE TABLE public.agentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  pais TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  cobertura TEXT[] DEFAULT '{}',
  servicios TEXT[] DEFAULT '{}',
  certificaciones TEXT[] DEFAULT '{}',
  sla_dias INTEGER DEFAULT 30,
  moneda TEXT DEFAULT 'USD',
  contacto_nombre TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  mudanzas_completadas INTEGER DEFAULT 0,
  tasa_cumplimiento INTEGER DEFAULT 100,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.agentes ENABLE ROW LEVEL SECURITY;

-- Políticas para agentes
CREATE POLICY "Todos los usuarios autenticados pueden ver agentes"
  ON public.agentes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Agentes pueden ver su propia información"
  ON public.agentes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins y coordinadores pueden gestionar agentes"
  ON public.agentes FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

-- ======================
-- TABLA DE MUDANZAS
-- ======================
CREATE TABLE public.mudanzas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  agente_id UUID REFERENCES public.agentes(id) ON DELETE SET NULL,
  coordinador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  
  -- Origen
  origen_pais TEXT NOT NULL,
  origen_ciudad TEXT NOT NULL,
  origen_direccion TEXT,
  
  -- Destino
  destino_pais TEXT NOT NULL,
  destino_ciudad TEXT NOT NULL,
  destino_direccion TEXT,
  
  -- Detalles de la mudanza
  estado public.estado_mudanza NOT NULL DEFAULT 'inspeccion',
  tipo public.tipo_mudanza NOT NULL,
  modo public.modo_transporte NOT NULL,
  prioridad public.prioridad NOT NULL DEFAULT 'media',
  
  -- Fechas
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_estimada DATE,
  fecha_inspeccion DATE,
  
  -- Volumetría
  volumen_estimado DECIMAL(10,2),
  peso_estimado DECIMAL(10,2),
  valor_declarado DECIMAL(12,2),
  
  -- Progreso
  progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  
  -- Metadatos
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.mudanzas ENABLE ROW LEVEL SECURITY;

-- Políticas para mudanzas
CREATE POLICY "Coordinadores y admins pueden ver todas las mudanzas"
  ON public.mudanzas FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'comercial')
  );

CREATE POLICY "Clientes pueden ver sus propias mudanzas"
  ON public.mudanzas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = mudanzas.cliente_id
      AND clientes.user_id = auth.uid()
    )
  );

CREATE POLICY "Agentes pueden ver mudanzas asignadas"
  ON public.mudanzas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agentes
      WHERE agentes.id = mudanzas.agente_id
      AND agentes.user_id = auth.uid()
    )
  );

CREATE POLICY "Coordinadores y admins pueden insertar mudanzas"
  ON public.mudanzas FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

CREATE POLICY "Coordinadores y admins pueden actualizar mudanzas"
  ON public.mudanzas FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

-- ======================
-- TABLA DE HITOS
-- ======================
CREATE TABLE public.hitos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  estado public.estado_mudanza NOT NULL,
  fecha_plan DATE,
  fecha_real TIMESTAMPTZ,
  completado BOOLEAN DEFAULT false,
  sla_dias INTEGER DEFAULT 0,
  responsable TEXT,
  comentarios TEXT,
  documentos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.hitos ENABLE ROW LEVEL SECURITY;

-- Políticas para hitos (heredan de mudanzas)
CREATE POLICY "Ver hitos si puedes ver la mudanza"
  ON public.hitos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mudanzas
      WHERE mudanzas.id = hitos.mudanza_id
    )
  );

CREATE POLICY "Coordinadores pueden gestionar hitos"
  ON public.hitos FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

-- ======================
-- TABLA DE INVENTARIO
-- ======================
CREATE TABLE public.inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  habitacion TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  condicion public.condicion_item NOT NULL DEFAULT 'buena',
  volumen DECIMAL(10,2),
  peso DECIMAL(10,2),
  valor_declarado DECIMAL(10,2),
  fotos TEXT[] DEFAULT '{}',
  embalaje TEXT,
  codigo_qr TEXT,
  ubicacion_bodega TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- Políticas para inventario (heredan de mudanzas)
CREATE POLICY "Ver inventario si puedes ver la mudanza"
  ON public.inventario FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mudanzas
      WHERE mudanzas.id = inventario.mudanza_id
    )
  );

CREATE POLICY "Coordinadores pueden gestionar inventario"
  ON public.inventario FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

-- ======================
-- TABLA DE DOCUMENTOS
-- ======================
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  estado TEXT DEFAULT 'pendiente',
  fecha_subida TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subido_por UUID REFERENCES public.profiles(id),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para documentos
CREATE POLICY "Ver documentos si puedes ver la mudanza"
  ON public.documentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mudanzas
      WHERE mudanzas.id = documentos.mudanza_id
    )
  );

CREATE POLICY "Usuarios autenticados pueden subir documentos"
  ON public.documentos FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ======================
-- TABLA DE COSTOS
-- ======================
CREATE TABLE public.costos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  descripcion TEXT,
  monto DECIMAL(12,2) NOT NULL,
  moneda TEXT DEFAULT 'USD',
  proveedor TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  estado TEXT DEFAULT 'pendiente',
  factura_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.costos ENABLE ROW LEVEL SECURITY;

-- Políticas para costos
CREATE POLICY "Finanzas y admins pueden ver todos los costos"
  ON public.costos FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finanzas') OR
    public.has_role(auth.uid(), 'coordinador')
  );

CREATE POLICY "Finanzas puede gestionar costos"
  ON public.costos FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'finanzas')
  );

-- ======================
-- TABLA DE COMUNICACIONES
-- ======================
CREATE TABLE public.comunicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mudanza_id UUID NOT NULL REFERENCES public.mudanzas(id) ON DELETE CASCADE,
  remitente_id UUID NOT NULL REFERENCES public.profiles(id),
  destinatario_id UUID REFERENCES public.profiles(id),
  mensaje TEXT NOT NULL,
  tipo TEXT DEFAULT 'mensaje',
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.comunicaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para comunicaciones
CREATE POLICY "Ver comunicaciones propias o de mudanzas asignadas"
  ON public.comunicaciones FOR SELECT
  USING (
    auth.uid() = remitente_id OR
    auth.uid() = destinatario_id OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'coordinador')
  );

CREATE POLICY "Usuarios autenticados pueden enviar mensajes"
  ON public.comunicaciones FOR INSERT
  WITH CHECK (auth.uid() = remitente_id);

-- ======================
-- TRIGGERS PARA UPDATED_AT
-- ======================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_clientes
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_agentes
  BEFORE UPDATE ON public.agentes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_mudanzas
  BEFORE UPDATE ON public.mudanzas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_hitos
  BEFORE UPDATE ON public.hitos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_inventario
  BEFORE UPDATE ON public.inventario
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_costos
  BEFORE UPDATE ON public.costos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ======================
-- FUNCIÓN Y TRIGGER PARA CREAR PERFIL
-- ======================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================
-- FUNCIÓN PARA GENERAR NÚMERO DE MUDANZA
-- ======================
CREATE OR REPLACE FUNCTION public.generate_mudanza_numero()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  counter INTEGER;
  new_numero TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 10) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.mudanzas
  WHERE numero LIKE 'MUD-' || year || '-%';
  
  new_numero := 'MUD-' || year || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_numero;
END;
$$ LANGUAGE plpgsql;