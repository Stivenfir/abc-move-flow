export type EstadoMudanza = 
  | "inspeccion"
  | "cotizacion"
  | "cotizacion_enviada"
  | "cotizacion_aceptada"
  | "booking"
  | "booking_solicitado"
  | "booking_confirmado"
  | "programacion_empaque"
  | "empaque"
  | "bodega"
  | "despacho"
  | "traslado_puerto"
  | "exportacion_completa"
  | "transito"
  | "en_transito_internacional"
  | "arribado_puerto"
  | "aduana"
  | "en_proceso_aduanas"
  | "levante_aprobado"
  | "programando_entrega"
  | "entrega"
  | "contenedor_devuelto"
  | "cerrado";

export type TipoOperacion = "exportacion" | "importacion";

export type TipoMudanza = 
  | "uav"
  | "excess-baggage"
  | "diplomatica"
  | "corporativa"
  | "privada"
  | "local"
  | "internacional";

export type ModoTransporte = "aereo" | "maritimo" | "terrestre";

export interface Mudanza {
  id: string;
  numero: string;
  tipo_operacion: TipoOperacion;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    tipo: "individual" | "corporativo" | "diplomatico";
  };
  origen: {
    pais: string;
    ciudad: string;
    direccion: string;
  };
  destino: {
    pais: string;
    ciudad: string;
    direccion: string;
  };
  estado: EstadoMudanza;
  tipo: TipoMudanza;
  modo: ModoTransporte;
  fechaCreacion: string;
  fechaEstimada: string;
  volumenEstimado: number;
  pesoEstimado: number;
  valorDeclarado: number;
  agente?: {
    id: string;
    nombre: string;
    pais: string;
    ciudad: string;
  };
  coordinador: {
    id: string;
    nombre: string;
    email: string;
  };
  progreso: number;
  prioridad: "baja" | "media" | "alta" | "urgente";
}

export interface Booking {
  id: string;
  mudanzaId: string;
  estado: string;
  bookingNumber?: string;
  fechaSolicitud: string;
  fechaConfirmacion?: string;
  cutoffFisico?: string;
  cutoffDocumental?: string;
  terminal?: string;
  naviera?: string;
  tipoContenedor?: string;
  blNumber?: string;
  dexNumber?: string;
  shippingInstructionsUrl?: string;
  blDraftUrl?: string;
  blFinalUrl?: string;
  certificadosUrl?: string[];
  notas?: string;
}

export interface Aduanas {
  id: string;
  mudanzaId: string;
  estado: string;
  tipoServicio: string;
  blNumber?: string;
  awbNumber?: string;
  arrivalNoticeUrl?: string;
  fechaArribo?: string;
  fechaLimitelevante?: string;
  fechaLevanteReal?: string;
  numeroDeclaracion?: string;
  fechaInspeccion?: string;
  tieneInspeccion: boolean;
  resultadoInspeccion?: string;
  documentosCompletos: boolean;
  levanteAprobado: boolean;
  levanteConNovedad: boolean;
  descripcionNovedad?: string;
  facturaFleteUrl?: string;
  documentosDianUrl?: string[];
  notas?: string;
}

export interface Contenedor {
  id: string;
  mudanzaId: string;
  numeroContenedor: string;
  tipo?: string;
  naviera?: string;
  fechaArribo?: string;
  fechaLimiteDevolucion: string;
  fechaDevolucionReal?: string;
  lugarDevolucion?: string;
  diasLibres: number;
  costoDemurrage?: number;
  costoDetention?: number;
  estado: string;
  alertasActivas: boolean;
  notas?: string;
}

export interface AduanasChecklistItem {
  id: string;
  aduanasId: string;
  item: string;
  completado: boolean;
  fechaCompletado?: string;
  responsable?: string;
  notas?: string;
}

export interface Hito {
  id: string;
  mudanzaId: string;
  estado: EstadoMudanza;
  fechaPlan: string;
  fechaReal?: string;
  completado: boolean;
  sla: number; // días
  responsable: string;
  comentarios?: string;
  documentos: string[];
}

export interface AgenteInternacional {
  id: string;
  nombre: string;
  pais: string;
  ciudad: string;
  cobertura: string[];
  servicios: string[];
  certificaciones: string[];
  sla: number;
  moneda: string;
  contacto: {
    nombre: string;
    email: string;
    telefono: string;
  };
  rating: number;
  mudanzasCompletadas: number;
  tasaCumplimiento: number;
}

export interface ItemInventario {
  id: string;
  mudanzaId: string;
  habitacion: string;
  descripcion: string;
  cantidad: number;
  condicion: "excelente" | "buena" | "regular" | "dañado";
  volumen: number;
  peso: number;
  valorDeclarado: number;
  fotos: string[];
  embalaje: string;
  codigoQR: string;
  notas?: string;
}
