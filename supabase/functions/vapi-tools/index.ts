/**
 * vapi-tools — Edge Function que maneja las tool calls de Vapi durante una llamada activa.
 *
 * Vapi llama a este endpoint cuando el modelo (Claude) quiere usar una herramienta:
 *   - obtenerInfoCliente  →  devuelve historial del cliente/mascota desde Supabase
 *   - agendarCita         →  crea un seguimiento en pc_seguimientos
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
    return new Response(JSON.stringify({ error: "Bad JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Vapi sends the message nested under body.message
  const msg = (body.message ?? body) as Record<string, unknown>;
  const toolCalls = (msg.toolCallList ?? []) as Array<{
    id: string;
    function: { name: string; arguments: string };
  }>;

  const results: Array<{ toolCallId: string; result: string }> = [];

  for (const call of toolCalls) {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(call.function.arguments || "{}");
    } catch {
      /* ignore parse errors */
    }

    const name = call.function.name;

    if (name === "obtenerInfoCliente") {
      const resultado = await handleObtenerInfoCliente(args);
      results.push({ toolCallId: call.id, result: resultado });
    } else if (name === "agendarCita") {
      const resultado = await handleAgendarCita(args, msg);
      results.push({ toolCallId: call.id, result: resultado });
    } else {
      results.push({ toolCallId: call.id, result: "Herramienta desconocida." });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

// ---------------------------------------------------------------------------

async function handleObtenerInfoCliente(args: Record<string, unknown>): Promise<string> {
  const nombreMascota = String(args.nombreMascota ?? "").toLowerCase().trim();
  if (!nombreMascota) return "No se proporcionó nombre de mascota.";

  // Buscar en CRM
  const { data: clientes } = await supabase
    .from("pc_clientes")
    .select("*")
    .ilike("nombreMascota", `%${nombreMascota}%`)
    .limit(1);

  const cliente = clientes?.[0];

  // Última visita en ventas
  const { data: ventas } = await supabase
    .from("pc_ventas")
    .select("fecha, area, servicio, total")
    .ilike("cliente", `%${nombreMascota}%`)
    .order("fecha", { ascending: false })
    .limit(5);

  // Seguimientos pendientes
  const { data: seguimientos } = await supabase
    .from("pc_seguimientos")
    .select("fecha, descripcion, tipo")
    .ilike("mascota", `%${nombreMascota}%`)
    .order("fecha", { ascending: false })
    .limit(3);

  const info: string[] = [];

  if (cliente) {
    if (cliente.nombrePropietario) info.push(`Propietario: ${cliente.nombrePropietario}`);
    if (cliente.especie) info.push(`Especie: ${cliente.especie}`);
    if (cliente.raza) info.push(`Raza: ${cliente.raza}`);
    if (cliente.edad) info.push(`Edad: ${cliente.edad}`);
    if (cliente.telefono) info.push(`Teléfono: ${cliente.telefono}`);
  }

  if (ventas && ventas.length > 0) {
    const ultima = ventas[0];
    info.push(`Última visita: ${ultima.fecha} (${ultima.area} — ${ultima.servicio || ""} RD$${ultima.total || 0})`);
  } else {
    info.push("No se encontraron visitas anteriores.");
  }

  if (seguimientos && seguimientos.length > 0) {
    const seg = seguimientos[0];
    info.push(`Seguimiento pendiente: ${seg.descripcion ?? ""} (${seg.fecha})`);
  }

  return info.length > 0 ? info.join("\n") : "No se encontró información del cliente.";
}

// ---------------------------------------------------------------------------

async function handleAgendarCita(
  args: Record<string, unknown>,
  msg: Record<string, unknown>,
): Promise<string> {
  const nombreMascota = String(args.nombreMascota ?? "").trim();
  const fecha = String(args.fecha ?? "").trim(); // YYYY-MM-DD o descripción libre
  const hora = String(args.hora ?? "").trim();
  const motivo = String(args.motivo ?? "Cita agendada por agente de voz").trim();

  if (!nombreMascota) return "Se necesita el nombre de la mascota para agendar.";

  // Derivar propietario de los argumentos o de la info de la llamada
  const nombrePropietario = String(
    args.nombrePropietario ?? (msg as Record<string, unknown>)?.nombrePropietario ?? ""
  ).trim();

  // Fecha ISO: intentar parsear o dejar como nota
  let fechaISO: string;
  try {
    const d = new Date(fecha);
    fechaISO = isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  } catch {
    fechaISO = new Date().toISOString().slice(0, 10);
  }

  const descripcion = hora
    ? `${motivo} — ${hora}`
    : motivo;

  // Guardar en pc_citas para visualizacion en Dashboard
  const callCustomer = (msg.call as Record<string, unknown>)?.customer as Record<string, unknown> ?? {};
  const telefono = String(callCustomer.number ?? args.telefono ?? "").replace(/\D/g, "").slice(-10);
  const servicio = String(args.servicio ?? motivo);

  const { error: errorCita } = await supabase.from("pc_citas").insert({
    fecha: fechaISO,
    hora: hora || null,
    mascota: nombreMascota,
    propietario: nombrePropietario || null,
    telefono: telefono || null,
    servicio,
    notas: motivo !== servicio ? motivo : null,
    estado: "pendiente",
    agendada_por: "sofia",
  });

  if (errorCita) {
    console.error("Error guardando en pc_citas:", errorCita);
    return "Hubo un problema al guardar la cita. Por favor registrarla manualmente.";
  }

  return `Cita agendada correctamente para ${nombreMascota} el ${fechaISO}${hora ? " a las " + hora : ""}. ¡Los esperamos en PetColinas!`;
}
