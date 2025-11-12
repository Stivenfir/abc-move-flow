export type EstadoMudanza = 
  | "inspeccion"
  | "cotizacion"
  | "booking"
  | "empaque"
  | "bodega"
  | "despacho"
  | "transito"
  | "aduana"
  | "entrega"
  | "cerrado";

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
