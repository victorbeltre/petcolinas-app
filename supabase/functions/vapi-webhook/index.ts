/**
 * vapi-webhook — Edge Function que recibe eventos de fin de llamada de Vapi.
 *
 * Registra cada llamada en pc_llamadas con: resultado, duración, transcripción.
 * Vapi debe estar configurado con serverUrl = URL de esta función.
 *
 * Eventos manejados:
 *   - end-of-call-report  →  graba el resumen completo
 *   - status-update       →  actualiza estado si la llamada no conectó
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response("ok", { status: 200 });
  }

  const msg = (body.message ?? body) as Record<string, unknown>;
  const type = String(msg.type ?? "");

  if (type === "end-of-call-report") {
    await handleEndOfCall(msg);
  } else if (type === "status-update") {
    await handleStatusUpdate(msg);
  }

  // Vapi espera 200 aunque no usemos el resultado
  return new Response(JSON.stringify({ received: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

// ---------------------------------------------------------------------------

async function handleEndOfCall(msg: Record<string, unknown>) {
  const call = (msg.call ?? {}) as Record<string, unknown>;
  const callId = String(call.id ?? msg.callId ?? "");
  const customer = (call.customer ?? {}) as Record<string, unknown>;
  const telefono = String(customer.number ?? "");
  const nombrePropietario = String(customer.name ?? "");
  const metadata = (call.metadata ?? {}) as Record<string, unknown>;

  const durationSeconds = Number(call.durationSeconds ?? msg.durationSeconds ?? 0);
  const transcript = String(msg.transcript ?? "");
  const summary = String(msg.summary ?? "");

  // Inferir resultado desde el endedReason o el summary
  const endedReason = String(call.endedReason ?? msg.endedReason ?? "");
  const resultado = inferirResultado(endedReason, transcript, summary);

  // Fecha de cita agendada — si se extrajo vía structuredData
  const structuredData = (msg.structuredData ?? {}) as Record<string, unknown>;
  const fechaCitaAgendada = String(structuredData.fechaCita ?? "") || null;

  const { error } = await supabase.from("pc_llamadas").upsert(
    {
      vapi_call_id: callId,
      telefono,
      nombre_propietario: nombrePropietario,
      nombre_mascota: String(metadata.nombreMascota ?? ""),
      motivo: String(metadata.motivo ?? "manual"),
      resultado,
      duracion_segundos: durationSeconds,
      transcripcion: transcript || null,
      notas: summary || null,
      fecha_cita_agendada: fechaCitaAgendada,
    },
    { onConflict: "vapi_call_id" },
  );

  if (error) {
    console.error("Error guardando llamada:", error);
  }
}

async function handleStatusUpdate(msg: Record<string, unknown>) {
  const callId = String((msg.call as Record<string, unknown>)?.id ?? msg.callId ?? "");
  const status = String(msg.status ?? "");

  // Solo registrar estados de no-conexión si aún no hay registro
  if (status === "ended" || !callId) return;

  const noContactoEstados = ["no-answer", "busy", "failed", "canceled"];
  const endedReason = String(
    (msg.call as Record<string, unknown>)?.endedReason ?? status ?? ""
  );

  if (noContactoEstados.some((s) => endedReason.includes(s))) {
    await supabase
      .from("pc_llamadas")
      .update({ resultado: "no_contesto" })
      .eq("vapi_call_id", callId);
  }
}

// ---------------------------------------------------------------------------

function inferirResultado(endedReason: string, transcript: string, summary: string): string {
  const r = endedReason.toLowerCase();
  const t = (transcript + " " + summary).toLowerCase();

  if (r.includes("no-answer") || r.includes("busy") || r.includes("failed")) {
    return "no_contesto";
  }
  if (r.includes("canceled")) return "no_contesto";

  // Leer el transcript para inferir resultado
  if (
    t.includes("cita agendada") ||
    t.includes("quedamos") ||
    t.includes("lo vemos") ||
    t.includes("perfecto para el")
  ) {
    return "cita_agendada";
  }
  if (
    t.includes("no me interesa") ||
    t.includes("no necesito") ||
    t.includes("no voy")
  ) {
    return "rechazo";
  }
  if (
    t.includes("llame más tarde") ||
    t.includes("llámeme") ||
    t.includes("llame después") ||
    t.includes("otro momento")
  ) {
    return "llamar_luego";
  }
  if (t.includes("número incorrecto") || t.includes("equivocado")) {
    return "numero_incorrecto";
  }

  return "completada";
}
