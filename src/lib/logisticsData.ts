// Mock data for ABC Cargo Logistic - ERP Logística Internacional

export interface Operacion {
  id: string;
  consecutivo: string;
  cliente: string;
  lineaProyecto: string;
  comercial: string;
  servicioNombre: string;
  tipoMercancia: string;
  fechaCondicion: string;
  tipoOperacion: "Importación" | "Exportación";
  modoTransporte: "Marítimo" | "Aéreo" | "Terrestre";
  activa: boolean;
  tipoNegociacion: string;
  cancelado: boolean;
  cerrado: boolean;
  origen: string;
  destino: string;
  estado: "En Tránsito" | "En Puerto" | "En Aduana" | "Entregado" | "Pendiente" | "Cancelado";
  valorUSD: number;
  peso: number;
  volumen: number;
  contenedores: number;
  blAwb: string;
  fechaCreacion: string;
  fechaEstimadaLlegada: string;
}

export interface Cotizacion {
  id: string;
  consecutivo: string;
  cliente: string;
  tipoOperacion: "Importación" | "Exportación";
  modoTransporte: "Marítimo" | "Aéreo" | "Terrestre";
  origen: string;
  destino: string;
  valorUSD: number;
  estado: "Borrador" | "Enviada" | "Aprobada" | "Rechazada" | "Vencida";
  fechaCreacion: string;
  fechaVencimiento: string;
  comercial: string;
  tipoMercancia: string;
}

export interface Cliente {
  id: string;
  razonSocial: string;
  nit: string;
  tipo: "Jurídico" | "Natural";
  estado: "Activo" | "Inactivo";
  categoria: "Importador" | "Exportador" | "Ambos";
  contactoPrincipal: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  operacionesActivas: number;
}

export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  estado: "Activo" | "Inactivo" | "Bloqueado";
  ultimoAcceso: string;
  login: string;
}

export interface Proveedor {
  id: string;
  razonSocial: string;
  nit: string;
  tipo: "Naviera" | "Aerolínea" | "Transportadora" | "Agente Aduanero" | "Almacén" | "Otro";
  estado: "Activo" | "Inactivo";
  contacto: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
}

export interface TasaCambio {
  id: string;
  monedaOrigen: string;
  monedaDestino: string;
  tasa: number;
  fecha: string;
}

// ==================== MOCK DATA ====================

export const mockOperaciones: Operacion[] = [
  {
    id: "1", consecutivo: "OPE-2026-001", cliente: "MABE COLOMBIA SAS",
    lineaProyecto: "Importación General", comercial: "Carlos Mendoza",
    servicioNombre: "FCL Import", tipoMercancia: "Electrodomésticos",
    fechaCondicion: "2026-02-15", tipoOperacion: "Importación",
    modoTransporte: "Marítimo", activa: true, tipoNegociacion: "CIF",
    cancelado: false, cerrado: false, origen: "Shanghai, China",
    destino: "Buenaventura, Colombia", estado: "En Tránsito",
    valorUSD: 125000, peso: 18500, volumen: 45, contenedores: 2,
    blAwb: "MAEU123456789", fechaCreacion: "2026-01-20",
    fechaEstimadaLlegada: "2026-03-10"
  },
  {
    id: "2", consecutivo: "OPE-2026-002", cliente: "INGERSOLL - RAND COLOMBIA SAS",
    lineaProyecto: "Exportación Especial", comercial: "Ana García",
    servicioNombre: "LCL Export", tipoMercancia: "Maquinaria Industrial",
    fechaCondicion: "2026-02-01", tipoOperacion: "Exportación",
    modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FOB",
    cancelado: false, cerrado: false, origen: "Cartagena, Colombia",
    destino: "Houston, USA", estado: "En Puerto",
    valorUSD: 87000, peso: 12000, volumen: 30, contenedores: 1,
    blAwb: "HLCU987654321", fechaCreacion: "2026-01-15",
    fechaEstimadaLlegada: "2026-03-05"
  },
  {
    id: "3", consecutivo: "OPE-2026-003", cliente: "EMBAJADA DE LOS ESTADOS UNIDOS",
    lineaProyecto: "Carga Diplomática", comercial: "Carlos Mendoza",
    servicioNombre: "Air Freight Import", tipoMercancia: "Menaje Diplomático",
    fechaCondicion: "2026-02-10", tipoOperacion: "Importación",
    modoTransporte: "Aéreo", activa: true, tipoNegociacion: "DDP",
    cancelado: false, cerrado: false, origen: "Miami, USA",
    destino: "Bogotá, Colombia", estado: "En Aduana",
    valorUSD: 45000, peso: 2500, volumen: 15, contenedores: 0,
    blAwb: "AWB-020-12345678", fechaCreacion: "2026-02-01",
    fechaEstimadaLlegada: "2026-02-22"
  },
  {
    id: "4", consecutivo: "OPE-2026-004", cliente: "WODEN COLOMBIA SAS",
    lineaProyecto: "Importación Materia Prima", comercial: "Luisa Rodríguez",
    servicioNombre: "FCL Import", tipoMercancia: "Químicos",
    fechaCondicion: "2026-01-28", tipoOperacion: "Importación",
    modoTransporte: "Marítimo", activa: false, tipoNegociacion: "CFR",
    cancelado: false, cerrado: true, origen: "Rotterdam, Países Bajos",
    destino: "Barranquilla, Colombia", estado: "Entregado",
    valorUSD: 210000, peso: 42000, volumen: 60, contenedores: 3,
    blAwb: "MSCU456789012", fechaCreacion: "2025-12-10",
    fechaEstimadaLlegada: "2026-02-05"
  },
  {
    id: "5", consecutivo: "OPE-2026-005", cliente: "VARISUR SAS",
    lineaProyecto: "Exportación Agrícola", comercial: "Ana García",
    servicioNombre: "Reefer Export", tipoMercancia: "Frutas Frescas",
    fechaCondicion: "2026-02-18", tipoOperacion: "Exportación",
    modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FOB",
    cancelado: false, cerrado: false, origen: "Santa Marta, Colombia",
    destino: "Amberes, Bélgica", estado: "Pendiente",
    valorUSD: 65000, peso: 22000, volumen: 55, contenedores: 2,
    blAwb: "Pendiente", fechaCreacion: "2026-02-15",
    fechaEstimadaLlegada: "2026-04-01"
  },
  {
    id: "6", consecutivo: "OPE-2026-006", cliente: "PROMOS LTDA",
    lineaProyecto: "Importación Retail", comercial: "Luisa Rodríguez",
    servicioNombre: "LCL Import", tipoMercancia: "Material Promocional",
    fechaCondicion: "2026-02-05", tipoOperacion: "Importación",
    modoTransporte: "Aéreo", activa: true, tipoNegociacion: "CIF",
    cancelado: false, cerrado: false, origen: "Shenzhen, China",
    destino: "Bogotá, Colombia", estado: "En Tránsito",
    valorUSD: 18500, peso: 800, volumen: 5, contenedores: 0,
    blAwb: "AWB-180-87654321", fechaCreacion: "2026-02-03",
    fechaEstimadaLlegada: "2026-02-25"
  },
  {
    id: "7", consecutivo: "OPE-2026-007", cliente: "POLIEMPAK SAS",
    lineaProyecto: "Exportación Industrial", comercial: "Carlos Mendoza",
    servicioNombre: "FCL Export", tipoMercancia: "Empaques Plásticos",
    fechaCondicion: "2026-02-12", tipoOperacion: "Exportación",
    modoTransporte: "Marítimo", activa: true, tipoNegociacion: "FOB",
    cancelado: false, cerrado: false, origen: "Buenaventura, Colombia",
    destino: "Callao, Perú", estado: "En Puerto",
    valorUSD: 32000, peso: 9000, volumen: 25, contenedores: 1,
    blAwb: "SUDU345678901", fechaCreacion: "2026-02-08",
    fechaEstimadaLlegada: "2026-03-01"
  },
  {
    id: "8", consecutivo: "OPE-2025-098", cliente: "MABE COLOMBIA SAS",
    lineaProyecto: "Importación General", comercial: "Ana García",
    servicioNombre: "FCL Import", tipoMercancia: "Repuestos",
    fechaCondicion: "2025-12-15", tipoOperacion: "Importación",
    modoTransporte: "Marítimo", activa: false, tipoNegociacion: "CIF",
    cancelado: true, cerrado: false, origen: "Yokohama, Japón",
    destino: "Buenaventura, Colombia", estado: "Cancelado",
    valorUSD: 78000, peso: 15000, volumen: 35, contenedores: 1,
    blAwb: "ONE-098765432", fechaCreacion: "2025-11-20",
    fechaEstimadaLlegada: "2026-01-15"
  },
];

export const mockCotizaciones: Cotizacion[] = [
  {
    id: "1", consecutivo: "COT-2026-001", cliente: "MABE COLOMBIA SAS",
    tipoOperacion: "Importación", modoTransporte: "Marítimo",
    origen: "Shanghai, China", destino: "Buenaventura, Colombia",
    valorUSD: 4500, estado: "Aprobada", fechaCreacion: "2026-01-10",
    fechaVencimiento: "2026-02-10", comercial: "Carlos Mendoza",
    tipoMercancia: "Electrodomésticos"
  },
  {
    id: "2", consecutivo: "COT-2026-002", cliente: "VARISUR SAS",
    tipoOperacion: "Exportación", modoTransporte: "Marítimo",
    origen: "Santa Marta, Colombia", destino: "Amberes, Bélgica",
    valorUSD: 3200, estado: "Enviada", fechaCreacion: "2026-02-12",
    fechaVencimiento: "2026-03-12", comercial: "Ana García",
    tipoMercancia: "Frutas Frescas"
  },
  {
    id: "3", consecutivo: "COT-2026-003", cliente: "WODEN COLOMBIA SAS",
    tipoOperacion: "Importación", modoTransporte: "Aéreo",
    origen: "Frankfurt, Alemania", destino: "Bogotá, Colombia",
    valorUSD: 8900, estado: "Borrador", fechaCreacion: "2026-02-18",
    fechaVencimiento: "2026-03-18", comercial: "Luisa Rodríguez",
    tipoMercancia: "Maquinaria de Precisión"
  },
  {
    id: "4", consecutivo: "COT-2026-004", cliente: "PROMOS LTDA",
    tipoOperacion: "Importación", modoTransporte: "Aéreo",
    origen: "Shenzhen, China", destino: "Bogotá, Colombia",
    valorUSD: 1200, estado: "Rechazada", fechaCreacion: "2026-01-25",
    fechaVencimiento: "2026-02-25", comercial: "Carlos Mendoza",
    tipoMercancia: "Material POP"
  },
  {
    id: "5", consecutivo: "COT-2026-005", cliente: "INGERSOLL - RAND COLOMBIA SAS",
    tipoOperacion: "Exportación", modoTransporte: "Marítimo",
    origen: "Cartagena, Colombia", destino: "Houston, USA",
    valorUSD: 5600, estado: "Vencida", fechaCreacion: "2025-12-01",
    fechaVencimiento: "2026-01-01", comercial: "Ana García",
    tipoMercancia: "Compresores Industriales"
  },
];

export const mockClientes: Cliente[] = [
  { id: "1", razonSocial: "MABE COLOMBIA SAS", nit: "900.123.456-7", tipo: "Jurídico", estado: "Activo", categoria: "Importador", contactoPrincipal: "Juan Pérez", email: "jperez@mabe.com.co", telefono: "+57 1 234 5678", ciudad: "Bogotá", pais: "Colombia", operacionesActivas: 2 },
  { id: "2", razonSocial: "EMBAJADA DE LOS ESTADOS UNIDOS", nit: "Diplomático", tipo: "Jurídico", estado: "Activo", categoria: "Importador", contactoPrincipal: "Michael Johnson", email: "logistics@usembassy.gov", telefono: "+57 1 275 2000", ciudad: "Bogotá", pais: "Colombia", operacionesActivas: 1 },
  { id: "3", razonSocial: "INGERSOLL - RAND COLOMBIA SAS", nit: "860.002.345-1", tipo: "Jurídico", estado: "Activo", categoria: "Ambos", contactoPrincipal: "María López", email: "mlopez@ingersollrand.com", telefono: "+57 1 345 6789", ciudad: "Bogotá", pais: "Colombia", operacionesActivas: 1 },
  { id: "4", razonSocial: "WODEN COLOMBIA SAS", nit: "901.234.567-8", tipo: "Jurídico", estado: "Activo", categoria: "Importador", contactoPrincipal: "Andrés Castro", email: "acastro@woden.co", telefono: "+57 1 456 7890", ciudad: "Medellín", pais: "Colombia", operacionesActivas: 0 },
  { id: "5", razonSocial: "VARISUR SAS", nit: "900.345.678-9", tipo: "Jurídico", estado: "Activo", categoria: "Exportador", contactoPrincipal: "Diana Ruiz", email: "druiz@varisur.com", telefono: "+57 5 678 9012", ciudad: "Santa Marta", pais: "Colombia", operacionesActivas: 1 },
  { id: "6", razonSocial: "PROMOS LTDA", nit: "830.567.890-2", tipo: "Jurídico", estado: "Activo", categoria: "Importador", contactoPrincipal: "Pedro Gómez", email: "pgomez@promos.co", telefono: "+57 1 567 8901", ciudad: "Bogotá", pais: "Colombia", operacionesActivas: 1 },
  { id: "7", razonSocial: "POLIEMPAK SAS", nit: "900.678.901-3", tipo: "Jurídico", estado: "Activo", categoria: "Exportador", contactoPrincipal: "Laura Martínez", email: "lmartinez@poliempak.com", telefono: "+57 2 789 0123", ciudad: "Cali", pais: "Colombia", operacionesActivas: 1 },
  { id: "8", razonSocial: "COMPAÑÍA GENERAL DE ACEROS SA", nit: "860.789.012-4", tipo: "Jurídico", estado: "Inactivo", categoria: "Importador", contactoPrincipal: "Roberto Sánchez", email: "rsanchez@aceros.com.co", telefono: "+57 1 890 1234", ciudad: "Bogotá", pais: "Colombia", operacionesActivas: 0 },
];

export const mockUsuarios: Usuario[] = [
  { id: "1", nombres: "Carlos", apellidos: "Mendoza", email: "cmendoza@abccargo.com", rol: "Comercial", estado: "Activo", ultimoAcceso: "2026-02-20 08:30", login: "cmendoza" },
  { id: "2", nombres: "Ana", apellidos: "García", email: "agarcia@abccargo.com", rol: "Comercial", estado: "Activo", ultimoAcceso: "2026-02-20 09:15", login: "agarcia" },
  { id: "3", nombres: "Luisa", apellidos: "Rodríguez", email: "lrodriguez@abccargo.com", rol: "Comercial", estado: "Activo", ultimoAcceso: "2026-02-19 17:45", login: "lrodriguez" },
  { id: "4", nombres: "Miguel", apellidos: "Torres", email: "mtorres@abccargo.com", rol: "Administrador", estado: "Activo", ultimoAcceso: "2026-02-20 07:00", login: "mtorres" },
  { id: "5", nombres: "Sandra", apellidos: "Díaz", email: "sdiaz@abccargo.com", rol: "Operaciones", estado: "Activo", ultimoAcceso: "2026-02-20 08:00", login: "sdiaz" },
  { id: "6", nombres: "Jorge", apellidos: "Vargas", email: "jvargas@abccargo.com", rol: "Finanzas", estado: "Activo", ultimoAcceso: "2026-02-19 16:30", login: "jvargas" },
  { id: "7", nombres: "Patricia", apellidos: "Moreno", email: "pmoreno@abccargo.com", rol: "Aduanas", estado: "Inactivo", ultimoAcceso: "2026-01-15 10:00", login: "pmoreno" },
];

export const mockProveedores: Proveedor[] = [
  { id: "1", razonSocial: "MAERSK LINE", nit: "EXT-001", tipo: "Naviera", estado: "Activo", contacto: "Servicio al Cliente", email: "bookings@maersk.com", telefono: "+57 1 650 0000", ciudad: "Bogotá", pais: "Colombia" },
  { id: "2", razonSocial: "HAPAG-LLOYD", nit: "EXT-002", tipo: "Naviera", estado: "Activo", contacto: "Depto. Comercial", email: "sales@hapag-lloyd.com", telefono: "+57 1 651 0000", ciudad: "Bogotá", pais: "Colombia" },
  { id: "3", razonSocial: "AVIANCA CARGO", nit: "860.010.111-5", tipo: "Aerolínea", estado: "Activo", contacto: "Cargo Sales", email: "cargo@avianca.com", telefono: "+57 1 587 0000", ciudad: "Bogotá", pais: "Colombia" },
  { id: "4", razonSocial: "AGENCIA DE ADUANAS REPRESENTACIONES ABC", nit: "900.111.222-3", tipo: "Agente Aduanero", estado: "Activo", contacto: "Director Operaciones", email: "ops@aduanasabc.com", telefono: "+57 1 432 0000", ciudad: "Bogotá", pais: "Colombia" },
  { id: "5", razonSocial: "ALMACÉN ALPOPULAR", nit: "860.222.333-4", tipo: "Almacén", estado: "Activo", contacto: "Jefe de Bodega", email: "bodega@alpopular.com", telefono: "+57 1 543 0000", ciudad: "Buenaventura", pais: "Colombia" },
];

export const mockTasasCambio: TasaCambio[] = [
  { id: "1", monedaOrigen: "USD", monedaDestino: "COP", tasa: 4185.50, fecha: "2026-02-20" },
  { id: "2", monedaOrigen: "EUR", monedaDestino: "USD", tasa: 1.0842, fecha: "2026-02-20" },
  { id: "3", monedaOrigen: "GBP", monedaDestino: "USD", tasa: 1.2634, fecha: "2026-02-20" },
  { id: "4", monedaOrigen: "CNY", monedaDestino: "USD", tasa: 0.1389, fecha: "2026-02-20" },
  { id: "5", monedaOrigen: "JPY", monedaDestino: "USD", tasa: 0.0066, fecha: "2026-02-20" },
];

export const rolesDisponibles = [
  "Administrador", "Comercial", "Operaciones", "Finanzas", "Aduanas", "Bodega",
  "Transporte", "Documentación", "Servicio al Cliente", "Gerencia", "Auditoría",
  "Sistemas", "RRHH", "Compras", "Ventas", "Facturación", "Cartera",
  "Tesorería", "Contabilidad", "Legal", "Calidad", "Logística",
];

// KPI helpers
export function getKPIs() {
  const ops = mockOperaciones;
  const activas = ops.filter(o => o.activa && !o.cancelado).length;
  const enTransito = ops.filter(o => o.estado === "En Tránsito").length;
  const importaciones = ops.filter(o => o.tipoOperacion === "Importación" && !o.cancelado).length;
  const exportaciones = ops.filter(o => o.tipoOperacion === "Exportación" && !o.cancelado).length;
  const valorTotal = ops.filter(o => !o.cancelado).reduce((sum, o) => sum + o.valorUSD, 0);
  const pendientes = ops.filter(o => o.estado === "Pendiente").length;

  return { activas, enTransito, importaciones, exportaciones, valorTotal, pendientes };
}
