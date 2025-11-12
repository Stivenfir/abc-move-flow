export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_communications: {
        Row: {
          agent_id: string
          body: string | null
          cc: string[] | null
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          mudanza_id: string | null
          payload_url: string | null
          recipients: string[]
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          agent_id: string
          body?: string | null
          cc?: string[] | null
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          mudanza_id?: string | null
          payload_url?: string | null
          recipients: string[]
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          agent_id?: string
          body?: string | null
          cc?: string[] | null
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          mudanza_id?: string | null
          payload_url?: string | null
          recipients?: string[]
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_communications_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_communications_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_financials: {
        Row: {
          agent_id: string
          ap_aging: Json | null
          ap_total: number | null
          ar_aging: Json | null
          ar_total: number | null
          created_at: string | null
          id: string
          net_balance: number | null
          period: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          ap_aging?: Json | null
          ap_total?: number | null
          ar_aging?: Json | null
          ar_total?: number | null
          created_at?: string | null
          id?: string
          net_balance?: number | null
          period: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          ap_aging?: Json | null
          ap_total?: number | null
          ar_aging?: Json | null
          ar_total?: number | null
          created_at?: string | null
          id?: string
          net_balance?: number | null
          period?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_financials_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_lanes: {
        Row: {
          agent_id: string
          created_at: string | null
          dest_city: string | null
          dest_country: string
          id: string
          mode: string | null
          origin_city: string | null
          origin_country: string
          service_type: string | null
          sla_targets: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          dest_city?: string | null
          dest_country: string
          id?: string
          mode?: string | null
          origin_city?: string | null
          origin_country: string
          service_type?: string | null
          sla_targets?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          dest_city?: string | null
          dest_country?: string
          id?: string
          mode?: string | null
          origin_city?: string | null
          origin_country?: string
          service_type?: string | null
          sla_targets?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_lanes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reciprocity: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          period: string
          received_services: number | null
          reciprocity_ratio: number | null
          sent_services: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          period: string
          received_services?: number | null
          reciprocity_ratio?: number | null
          sent_services?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          period?: string
          received_services?: number | null
          reciprocity_ratio?: number | null
          sent_services?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_reciprocity_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_statements: {
        Row: {
          agent_id: string
          created_at: string | null
          file_url: string | null
          id: string
          period_end: string
          period_start: string
          sent_at: string | null
          sent_to: string[] | null
          status: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          period_end: string
          period_start: string
          sent_at?: string | null
          sent_to?: string[] | null
          status?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          period_end?: string
          period_start?: string
          sent_at?: string | null
          sent_to?: string[] | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_statements_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_stats: {
        Row: {
          agent_id: string
          bookings: number | null
          claims_per_100: number | null
          created_at: string | null
          doc_ok_pct: number | null
          gross_margin: number | null
          id: string
          m3_total: number | null
          nps_avg: number | null
          on_time_pct: number | null
          period: string
          received_services: number | null
          revenue: number | null
          sent_services: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          bookings?: number | null
          claims_per_100?: number | null
          created_at?: string | null
          doc_ok_pct?: number | null
          gross_margin?: number | null
          id?: string
          m3_total?: number | null
          nps_avg?: number | null
          on_time_pct?: number | null
          period: string
          received_services?: number | null
          revenue?: number | null
          sent_services?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          bookings?: number | null
          claims_per_100?: number | null
          created_at?: string | null
          doc_ok_pct?: number | null
          gross_margin?: number | null
          id?: string
          m3_total?: number | null
          nps_avg?: number | null
          on_time_pct?: number | null
          period?: string
          received_services?: number | null
          revenue?: number | null
          sent_services?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_stats_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      agentes: {
        Row: {
          activo: boolean | null
          assignment_rules: Json | null
          certificaciones: string[] | null
          ciudad: string
          cobertura: string[] | null
          contacto_email: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string
          doc_preferences: Json | null
          id: string
          internal_notes: string | null
          lane_strengths: Json | null
          moneda: string | null
          mudanzas_completadas: number | null
          network: string | null
          nombre: string
          pais: string
          preferred_currency: string | null
          rating: number | null
          servicios: string[] | null
          sla_dias: number | null
          status: string | null
          tasa_cumplimiento: number | null
          time_zone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          assignment_rules?: Json | null
          certificaciones?: string[] | null
          ciudad: string
          cobertura?: string[] | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          doc_preferences?: Json | null
          id?: string
          internal_notes?: string | null
          lane_strengths?: Json | null
          moneda?: string | null
          mudanzas_completadas?: number | null
          network?: string | null
          nombre: string
          pais: string
          preferred_currency?: string | null
          rating?: number | null
          servicios?: string[] | null
          sla_dias?: number | null
          status?: string | null
          tasa_cumplimiento?: number | null
          time_zone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          assignment_rules?: Json | null
          certificaciones?: string[] | null
          ciudad?: string
          cobertura?: string[] | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          doc_preferences?: Json | null
          id?: string
          internal_notes?: string | null
          lane_strengths?: Json | null
          moneda?: string | null
          mudanzas_completadas?: number | null
          network?: string | null
          nombre?: string
          pais?: string
          preferred_currency?: string | null
          rating?: number | null
          servicios?: string[] | null
          sla_dias?: number | null
          status?: string | null
          tasa_cumplimiento?: number | null
          time_zone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agentes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ciudad: string | null
          created_at: string
          direccion: string | null
          email: string
          empresa: string | null
          id: string
          nombre: string
          notas: string | null
          pais: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_cliente"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ciudad?: string | null
          created_at?: string
          direccion?: string | null
          email: string
          empresa?: string | null
          id?: string
          nombre: string
          notas?: string | null
          pais?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ciudad?: string | null
          created_at?: string
          direccion?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          pais?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_cliente"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicaciones: {
        Row: {
          created_at: string
          destinatario_id: string | null
          id: string
          leido: boolean | null
          mensaje: string
          mudanza_id: string
          remitente_id: string
          tipo: string | null
        }
        Insert: {
          created_at?: string
          destinatario_id?: string | null
          id?: string
          leido?: boolean | null
          mensaje: string
          mudanza_id: string
          remitente_id: string
          tipo?: string | null
        }
        Update: {
          created_at?: string
          destinatario_id?: string | null
          id?: string
          leido?: boolean | null
          mensaje?: string
          mudanza_id?: string
          remitente_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comunicaciones_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicaciones_remitente_id_fkey"
            columns: ["remitente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      costos: {
        Row: {
          concepto: string
          created_at: string
          descripcion: string | null
          estado: string | null
          factura_url: string | null
          fecha: string
          id: string
          moneda: string | null
          monto: number
          mudanza_id: string
          proveedor: string | null
          updated_at: string
        }
        Insert: {
          concepto: string
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          factura_url?: string | null
          fecha?: string
          id?: string
          moneda?: string | null
          monto: number
          mudanza_id: string
          proveedor?: string | null
          updated_at?: string
        }
        Update: {
          concepto?: string
          created_at?: string
          descripcion?: string | null
          estado?: string | null
          factura_url?: string | null
          fecha?: string
          id?: string
          moneda?: string | null
          monto?: number
          mudanza_id?: string
          proveedor?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costos_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          estado: string | null
          fecha_subida: string
          id: string
          mudanza_id: string
          nombre: string
          notas: string | null
          subido_por: string | null
          tipo: string
          url: string
        }
        Insert: {
          created_at?: string
          estado?: string | null
          fecha_subida?: string
          id?: string
          mudanza_id: string
          nombre: string
          notas?: string | null
          subido_por?: string | null
          tipo: string
          url: string
        }
        Update: {
          created_at?: string
          estado?: string | null
          fecha_subida?: string
          id?: string
          mudanza_id?: string
          nombre?: string
          notas?: string | null
          subido_por?: string | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_subido_por_fkey"
            columns: ["subido_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hitos: {
        Row: {
          comentarios: string | null
          completado: boolean | null
          created_at: string
          documentos: string[] | null
          estado: Database["public"]["Enums"]["estado_mudanza"]
          fecha_plan: string | null
          fecha_real: string | null
          id: string
          mudanza_id: string
          responsable: string | null
          sla_dias: number | null
          updated_at: string
        }
        Insert: {
          comentarios?: string | null
          completado?: boolean | null
          created_at?: string
          documentos?: string[] | null
          estado: Database["public"]["Enums"]["estado_mudanza"]
          fecha_plan?: string | null
          fecha_real?: string | null
          id?: string
          mudanza_id: string
          responsable?: string | null
          sla_dias?: number | null
          updated_at?: string
        }
        Update: {
          comentarios?: string | null
          completado?: boolean | null
          created_at?: string
          documentos?: string[] | null
          estado?: Database["public"]["Enums"]["estado_mudanza"]
          fecha_plan?: string | null
          fecha_real?: string | null
          id?: string
          mudanza_id?: string
          responsable?: string | null
          sla_dias?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hitos_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          cantidad: number | null
          codigo_qr: string | null
          condicion: Database["public"]["Enums"]["condicion_item"]
          created_at: string
          descripcion: string
          embalaje: string | null
          fotos: string[] | null
          habitacion: string
          id: string
          mudanza_id: string
          notas: string | null
          peso: number | null
          ubicacion_bodega: string | null
          updated_at: string
          valor_declarado: number | null
          volumen: number | null
        }
        Insert: {
          cantidad?: number | null
          codigo_qr?: string | null
          condicion?: Database["public"]["Enums"]["condicion_item"]
          created_at?: string
          descripcion: string
          embalaje?: string | null
          fotos?: string[] | null
          habitacion: string
          id?: string
          mudanza_id: string
          notas?: string | null
          peso?: number | null
          ubicacion_bodega?: string | null
          updated_at?: string
          valor_declarado?: number | null
          volumen?: number | null
        }
        Update: {
          cantidad?: number | null
          codigo_qr?: string | null
          condicion?: Database["public"]["Enums"]["condicion_item"]
          created_at?: string
          descripcion?: string
          embalaje?: string | null
          fotos?: string[] | null
          habitacion?: string
          id?: string
          mudanza_id?: string
          notas?: string | null
          peso?: number | null
          ubicacion_bodega?: string | null
          updated_at?: string
          valor_declarado?: number | null
          volumen?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
        ]
      }
      mudanzas: {
        Row: {
          agente_id: string | null
          cliente_id: string
          coordinador_id: string
          created_at: string
          destino_ciudad: string
          destino_direccion: string | null
          destino_pais: string
          estado: Database["public"]["Enums"]["estado_mudanza"]
          fecha_creacion: string
          fecha_estimada: string | null
          fecha_inspeccion: string | null
          id: string
          modo: Database["public"]["Enums"]["modo_transporte"]
          notas: string | null
          numero: string
          origen_ciudad: string
          origen_direccion: string | null
          origen_pais: string
          peso_estimado: number | null
          prioridad: Database["public"]["Enums"]["prioridad"]
          progreso: number | null
          tipo: Database["public"]["Enums"]["tipo_mudanza"]
          updated_at: string
          valor_declarado: number | null
          volumen_estimado: number | null
        }
        Insert: {
          agente_id?: string | null
          cliente_id: string
          coordinador_id: string
          created_at?: string
          destino_ciudad: string
          destino_direccion?: string | null
          destino_pais: string
          estado?: Database["public"]["Enums"]["estado_mudanza"]
          fecha_creacion?: string
          fecha_estimada?: string | null
          fecha_inspeccion?: string | null
          id?: string
          modo: Database["public"]["Enums"]["modo_transporte"]
          notas?: string | null
          numero: string
          origen_ciudad: string
          origen_direccion?: string | null
          origen_pais: string
          peso_estimado?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          tipo: Database["public"]["Enums"]["tipo_mudanza"]
          updated_at?: string
          valor_declarado?: number | null
          volumen_estimado?: number | null
        }
        Update: {
          agente_id?: string | null
          cliente_id?: string
          coordinador_id?: string
          created_at?: string
          destino_ciudad?: string
          destino_direccion?: string | null
          destino_pais?: string
          estado?: Database["public"]["Enums"]["estado_mudanza"]
          fecha_creacion?: string
          fecha_estimada?: string | null
          fecha_inspeccion?: string | null
          id?: string
          modo?: Database["public"]["Enums"]["modo_transporte"]
          notas?: string | null
          numero?: string
          origen_ciudad?: string
          origen_direccion?: string | null
          origen_pais?: string
          peso_estimado?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          tipo?: Database["public"]["Enums"]["tipo_mudanza"]
          updated_at?: string
          valor_declarado?: number | null
          volumen_estimado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mudanzas_agente_id_fkey"
            columns: ["agente_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mudanzas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mudanzas_coordinador_id_fkey"
            columns: ["coordinador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nombre_completo: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nombre_completo: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nombre_completo?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shipment_moves: {
        Row: {
          agent_id: string
          claims_count: number | null
          cost_alloc: number | null
          created_at: string | null
          doc_ok: boolean | null
          id: string
          mudanza_id: string
          on_time_hit: boolean | null
          revenue_alloc: number | null
          role: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          claims_count?: number | null
          cost_alloc?: number | null
          created_at?: string | null
          doc_ok?: boolean | null
          id?: string
          mudanza_id: string
          on_time_hit?: boolean | null
          revenue_alloc?: number | null
          role: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          claims_count?: number | null
          cost_alloc?: number | null
          created_at?: string | null
          doc_ok?: boolean | null
          id?: string
          mudanza_id?: string
          on_time_hit?: boolean | null
          revenue_alloc?: number | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_moves_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_moves_mudanza_id_fkey"
            columns: ["mudanza_id"]
            isOneToOne: false
            referencedRelation: "mudanzas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_mudanza_numero: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      condicion_item: "excelente" | "buena" | "regular" | "dañado"
      estado_mudanza:
        | "inspeccion"
        | "cotizacion"
        | "booking"
        | "empaque"
        | "bodega"
        | "despacho"
        | "transito"
        | "aduana"
        | "entrega"
        | "cerrado"
      modo_transporte: "aereo" | "maritimo" | "terrestre"
      prioridad: "baja" | "media" | "alta" | "urgente"
      tipo_cliente: "individual" | "corporativo" | "diplomatico"
      tipo_mudanza:
        | "uav"
        | "excess_baggage"
        | "diplomatica"
        | "corporativa"
        | "privada"
        | "local"
        | "internacional"
      user_role:
        | "admin"
        | "coordinador"
        | "cliente"
        | "agente"
        | "finanzas"
        | "comercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      condicion_item: ["excelente", "buena", "regular", "dañado"],
      estado_mudanza: [
        "inspeccion",
        "cotizacion",
        "booking",
        "empaque",
        "bodega",
        "despacho",
        "transito",
        "aduana",
        "entrega",
        "cerrado",
      ],
      modo_transporte: ["aereo", "maritimo", "terrestre"],
      prioridad: ["baja", "media", "alta", "urgente"],
      tipo_cliente: ["individual", "corporativo", "diplomatico"],
      tipo_mudanza: [
        "uav",
        "excess_baggage",
        "diplomatica",
        "corporativa",
        "privada",
        "local",
        "internacional",
      ],
      user_role: [
        "admin",
        "coordinador",
        "cliente",
        "agente",
        "finanzas",
        "comercial",
      ],
    },
  },
} as const
