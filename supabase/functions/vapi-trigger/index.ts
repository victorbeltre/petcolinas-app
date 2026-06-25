const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { nombreMascota, nombrePropietario, telefono, motivo, contexto } = body

    const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY') ?? ''
    const VAPI_ASSISTANT_ID = Deno.env.get('VAPI_ASSISTANT_ID') ?? ''
    const VAPI_PHONE_NUMBER_ID = Deno.env.get('VAPI_PHONE_NUMBER_ID') ?? ''

    // Normalize phone number to E.164
    let phone = (telefono ?? '').replace(/\D/g, '')
    if (phone.length === 10) phone = '+1' + phone
    else if (phone.length === 7) phone = '+1809' + phone
    else if (!phone.startsWith('+')) phone = '+' + phone

    const firstMessages: Record<string, string> = {
      agendar_cita: `¡Hola! Le habla Sofía, la asistente virtual de PetColinas. ¿Con quién tengo el gusto de hablar?`,
      seguimiento_vencido: `¡Hola! Soy Sofía de PetColinas. Le llamo porque ${nombreMascota || 'su mascota'} tiene un seguimiento médico pendiente. ¿Tiene un momento para hablar?`,
      recordatorio_vacuna: `¡Hola! Le contacta Sofía de PetColinas. Le llamamos porque ${nombreMascota || 'su mascota'} tiene una vacuna próxima a vencer. ¿Desea agendar su cita?`,
      default: `¡Hola! Soy Sofía de PetColinas. ¿Cómo están hoy?`,
    }

    const firstMessage = firstMessages[motivo ?? 'default'] ?? firstMessages.default

    const payload: Record<string, unknown> = {
      assistantId: VAPI_ASSISTANT_ID,
      customer: {
        number: phone,
        name: nombrePropietario ?? '',
      },
      assistantOverrides: {
        firstMessage,
        variableValues: {
          nombreMascota: nombreMascota ?? '',
          nombrePropietario: nombrePropietario ?? '',
          motivo: motivo ?? 'general',
          contexto: contexto ?? '',
        },
      },
    }

    // Only include phoneNumberId if set (required for outbound calls)
    if (VAPI_PHONE_NUMBER_ID) {
      payload.phoneNumberId = VAPI_PHONE_NUMBER_ID
    }

    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
