/**
 * vapi-trigger — Edge Function que inicia una llamada saliente via Vapi.
 *
 * La app PetColinas llama a este endpoint con:
 *   { nombreMascota, nombrePropietario, telefono, motivo, contexto? }
 *
 * Este endpoint:
 *   1. Valida la solicitud
 *   2. Construye el firstMessage personalizado
 *   3. Llama a la API de Vapi para iniciar la llamada
 *   4. Crea el registro inicial en pc_llamadas (resultado=pendiente)
 *   5. Devuelve { callId, status }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY")!;
const VAPI_ASSISTANT_ID = Deno.env.get("VAPI_ASSISTANT_ID")!;
const VAPI_PHONE_NUMBER_ID = Deno.env.get("VAPI_PHONE_NUMBER_ID")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const nombreMascota = String(body.nombreMascota ?? "").trim();
  const nombrePropietario = String(body.nombrePropietario ?? "").trim();
  let telefono = String(body.telefono ?? "").trim().replace(/\s|-/g, "");
  const motivo = String(body.motivo ?? "manual").trim();
  const contexto = String(body.contexto ?? "").trim();

  if (!nombreMascota || !telefono) {
    return json({ error: "Se requieren nombreMascota y telefono." }, 400);
  }

  // Normalizar número dominicano → E.164
  if (!telefono.startsWith("+")) {
    // DR usa +1 como prefijo (NANP: 809, 829, 849)
    if (telefono.startsWith("1") && telefono.length === 11) {
      telefono = "+" + telefono;
    } else if (telefono.length === 10) {
      telefono = "+1" + telefono;
    } else if (telefono.length === 7) {
      telefono = "+1809" + telefono; // asumir Santo Domingo si solo 7 dígitos
    } else {
      telefono = "+" + telefono;
    }
  }

  // Primer mensaje personalizado según motivo
  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
  const primerNombre = nombrePropietario.split(" ")[0] || "señor/a";

  const firstMessageMap: Record<string, string> = {
    seguimiento_vencido: `${saludo}, ¿con ${primerNombre} hablo? Le llamo de PetColinas para dar seguimiento a ${nombreMascota}.`,
    cliente_inactivo: `${saludo}, ¿con ${primerNombre} hablo? Le llamo de PetColinas para saber cómo está ${nombreMascota}.`,
    post_consulta: `${saludo}, ¿con ${primerNombre} hablo? Le llamo de PetColinas para preguntar cómo ha seguido ${nombreMascota} después de su última visita.`,
    manual: `${saludo}, ¿con ${primerNombre} hablo? Le llamo de PetColinas para hablar sobre ${nombreMascota}.`,
  };

  const firstMessage = firstMessageMap[motivo] ?? firstMessageMap.manual;

  // Llamar a Vapi API
  const vapiPayload = {
    assistantId: VAPI_ASSISTANT_ID,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: telefono,
      name: nombrePropietario,
    },
    assistantOverrides: {
      firstMessage,
      variableValues: {
        nombreMascota,
        nombrePropietario,
        motivo,
        contexto,
      },
    },
    metadata: {
      nombreMascota,
      nombrePropietario,
      motivo,
      origen: "petcolinas_app",
    },
  };

  let vapiResponse: Record<string, unknown>;
  try {
    const resp = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vapiPayload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Vapi error:", resp.status, errText);
      return json({ error: `Vapi error ${resp.status}: ${errText}` }, 502);
    }

    vapiResponse = await resp.json() as Record<string, unknown>;
  } catch (err) {
    console.error("Error conectando con Vapi:", err);
    return json({ error: "No se pudo conectar con Vapi." }, 502);
  }

  const callId = String(vapiResponse.id ?? "");

  // Crear registro inicial en pc_llamadas
  await supabase.from("pc_llamadas").insert({
    vapi_call_id: callId,
    nombre_mascota: nombreMascota,
    nombre_propietario: nombrePropietario,
    telefono,
    motivo,
    resultado: "pendiente",
    notas: contexto || null,
  });

  return json({ callId, status: "iniciada", telefono });
});

// ---------------------------------------------------------------------------

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
