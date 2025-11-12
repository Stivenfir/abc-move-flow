-- Deshabilitar autenticación temporalmente - Permitir acceso público

-- Agregar políticas públicas para mudanzas
CREATE POLICY "Permitir acceso público a mudanzas (temporal)"
ON public.mudanzas
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para clientes
CREATE POLICY "Permitir acceso público a clientes (temporal)"
ON public.clientes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para agentes
CREATE POLICY "Permitir acceso público a agentes (temporal)"
ON public.agentes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para hitos
CREATE POLICY "Permitir acceso público a hitos (temporal)"
ON public.hitos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para inventario
CREATE POLICY "Permitir acceso público a inventario (temporal)"
ON public.inventario
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para documentos
CREATE POLICY "Permitir acceso público a documentos (temporal)"
ON public.documentos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para eventos
CREATE POLICY "Permitir acceso público a eventos (temporal)"
ON public.mudanza_eventos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para alertas
CREATE POLICY "Permitir acceso público a alertas (temporal)"
ON public.alertas
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para costos
CREATE POLICY "Permitir acceso público a costos (temporal)"
ON public.costos
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para comunicaciones
CREATE POLICY "Permitir acceso público a comunicaciones (temporal)"
ON public.comunicaciones
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para profiles
CREATE POLICY "Permitir acceso público a profiles (temporal)"
ON public.profiles
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para stats de agentes
CREATE POLICY "Permitir acceso público a agent_stats (temporal)"
ON public.agent_stats
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para lanes de agentes
CREATE POLICY "Permitir acceso público a agent_lanes (temporal)"
ON public.agent_lanes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para reciprocidad de agentes
CREATE POLICY "Permitir acceso público a agent_reciprocity (temporal)"
ON public.agent_reciprocity
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para financials de agentes
CREATE POLICY "Permitir acceso público a agent_financials (temporal)"
ON public.agent_financials
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para statements de agentes
CREATE POLICY "Permitir acceso público a agent_statements (temporal)"
ON public.agent_statements
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para comunicaciones de agentes
CREATE POLICY "Permitir acceso público a agent_communications (temporal)"
ON public.agent_communications
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Agregar políticas públicas para shipment_moves
CREATE POLICY "Permitir acceso público a shipment_moves (temporal)"
ON public.shipment_moves
FOR ALL
TO public
USING (true)
WITH CHECK (true);