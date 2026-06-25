const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPA_URL = Deno.env.get('SUPABASE_URL') ?? 'https://ulrzzddovkioxeaarnjk.supabase.co'
const SUPA_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

async function dbInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(row),
  })
  return res.ok
}

async function dbQuery(table: string, params: string) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const message = body.message ?? body

    const toolCallList = message.toolCallList ?? message.tool_call_list ?? []
    const customerPhone = message.call?.customer?.number ?? body.call?.customer?.number ?? ''

    const results = []

    for (const toolCall of toolCallList) {
      const toolCallId = toolCall.id ?? toolCall.toolCallId
      const fn = toolCall.function ?? {}
      const name = fn.name ?? ''
      let args: Record<string, string> = {}
      try {
        args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : (fn.arguments ?? {})
      } catch { /* ignore */ }

      if (name === 'agendarCita') {
        const { fecha, hora, servicio, mascota, propietario, notas } = args
        const telefono = customerPhone || args.telefono || ''

        const saved = await dbInsert('pc_citas', {
          fecha: fecha ?? new Date().toISOString().slice(0, 10),
          hora: hora ?? '',
          mascota: mascota ?? '',
          propietario: propietario ?? '',
          telefono: telefono.replace(/\D/g, '').slice(-10),
          servicio: servicio ?? 'consulta',
          notas: notas ?? '',
          estado: 'pendiente',
          agendada_por: 'sofia',
        })

        if (saved) {
          const fechaStr = fecha
            ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })
            : 'la fecha acordada'
          results.push({
            toolCallId,
            result: `¡Perfecto! La cita para ${mascota || 'su mascota'} ha sido agendada exitosamente para el ${fechaStr} a las ${hora || 'la hora acordada'} para el servicio de ${servicio || 'consulta'}. ¡Los esperamos en PetColinas!`,
          })
        } else {
          results.push({
            toolCallId,
            result: 'Hubo un problema al guardar la cita. Por favor llame directamente a PetColinas para confirmar.',
          })
        }

      } else if (name === 'obtenerInfoCliente') {
        const { nombreMascota, telefono } = args
        const tel = (telefono || customerPhone).replace(/\D/g, '').slice(-10)

        let rows = null
        if (nombreMascota) {
          rows = await dbQuery('pc_clientes', `?nombremascota=ilike.*${encodeURIComponent(nombreMascota)}*&limit=1`)
        } else if (tel) {
          rows = await dbQuery('pc_clientes', `?telefono=eq.${tel}&limit=1`)
        }

        const c = Array.isArray(rows) ? rows[0] : null
        if (c) {
          results.push({
            toolCallId,
            result: `Cliente encontrado: ${c.nombremascota || ''}, propietario ${c.nombrepropietario || ''}. Teléfono: ${c.telefono || ''}. Especie: ${c.especie || ''}. Raza: ${c.raza || ''}.`,
          })
        } else {
          results.push({
            toolCallId,
            result: 'Cliente no encontrado en el sistema. Puede ser un cliente nuevo.',
          })
        }

      } else {
        results.push({ toolCallId, result: `Herramienta "${name}" no reconocida.` })
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
