import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  mudanzaNumero: string;
  documentoTipo: string;
  pdfBase64: string;
  clienteNombre?: string;
  agenteNombre?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Email service not configured. Please add RESEND_API_KEY." 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      }
    );
  }

  try {
    const { to, mudanzaNumero, documentoTipo, pdfBase64, clienteNombre, agenteNombre }: EmailRequest = await req.json();

    console.log(`Sending ${documentoTipo} for mudanza ${mudanzaNumero} to ${to}`);

    // Use Resend API directly via fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mudanzas Internacionales <onboarding@resend.dev>",
        to: [to],
        subject: `Documento: ${documentoTipo} - Mudanza ${mudanzaNumero}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Documento de Mudanza Internacional</h2>
            <p>Estimado/a ${clienteNombre || agenteNombre || 'Cliente'},</p>
            <p>Adjuntamos el documento <strong>${documentoTipo}</strong> correspondiente a la mudanza <strong>${mudanzaNumero}</strong>.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Mudanza:</strong> ${mudanzaNumero}</p>
              <p style="margin: 5px 0;"><strong>Documento:</strong> ${documentoTipo}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <p>Si tiene alguna duda, no dude en contactarnos.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Este es un correo automático, por favor no responder.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `${documentoTipo}_${mudanzaNumero}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

    return new Response(
      JSON.stringify({ success: true, emailId: responseData.id }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
