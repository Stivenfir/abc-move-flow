import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLIENTIFY_API_KEY = Deno.env.get("CLIENTIFY_API_KEY");
const CLIENTIFY_API_URL = "https://api.clientify.net/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MudanzaData {
  numero: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    tipo: string;
  };
  origen_pais: string;
  origen_ciudad: string;
  destino_pais: string;
  destino_ciudad: string;
  tipo: string;
  modo: string;
  fecha_estimada?: string;
  volumen_estimado?: number;
  peso_estimado?: number;
  valor_declarado?: number;
}

async function syncToClientify(action: string, mudanza: MudanzaData) {
  if (!CLIENTIFY_API_KEY) {
    console.warn("CLIENTIFY_API_KEY not configured, skipping sync");
    return { success: false, message: "API key not configured" };
  }

  try {
    // Crear o actualizar contacto en Clientify
    const contactPayload = {
      first_name: mudanza.cliente.nombre.split(" ")[0],
      last_name: mudanza.cliente.nombre.split(" ").slice(1).join(" ") || "-",
      email: mudanza.cliente.email,
      phone: mudanza.cliente.telefono,
      tags: [mudanza.cliente.tipo, "mudanza"],
      custom_fields: {
        tipo_cliente: mudanza.cliente.tipo,
      },
    };

    const contactResponse = await fetch(`${CLIENTIFY_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${CLIENTIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    let contactId = null;
    if (contactResponse.ok) {
      const contactData = await contactResponse.json();
      contactId = contactData.id;
    }

    // Crear deal (oportunidad) en Clientify
    const dealPayload = {
      title: `Mudanza ${mudanza.numero}`,
      contact_id: contactId,
      value: mudanza.valor_declarado || 0,
      currency: "USD",
      status: "open",
      tags: [mudanza.tipo, mudanza.modo],
      custom_fields: {
        numero_mudanza: mudanza.numero,
        origen: `${mudanza.origen_ciudad}, ${mudanza.origen_pais}`,
        destino: `${mudanza.destino_ciudad}, ${mudanza.destino_pais}`,
        tipo_mudanza: mudanza.tipo,
        modo_transporte: mudanza.modo,
        volumen_m3: mudanza.volumen_estimado,
        peso_kg: mudanza.peso_estimado,
        fecha_estimada: mudanza.fecha_estimada,
      },
    };

    const dealResponse = await fetch(`${CLIENTIFY_API_URL}/deals`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${CLIENTIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealPayload),
    });

    if (!dealResponse.ok) {
      const errorText = await dealResponse.text();
      throw new Error(`Clientify API error: ${errorText}`);
    }

    const dealData = await dealResponse.json();
    return { success: true, contactId, dealId: dealData.id };
  } catch (error) {
    console.error("Error syncing to Clientify:", error);
    return { success: false, error: (error as Error).message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, mudanza } = await req.json();

    if (action === "create_mudanza") {
      const result = await syncToClientify(action, mudanza);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: result.success ? 200 : 500,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
