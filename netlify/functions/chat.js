// Netlify Functions v2 format
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { systemPrompt, messages, maxTokens = 1000, stream = false } = await req.json()

  const apiKey = Netlify.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Convert messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  const model = 'gemini-2.5-flash'
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}`

  const body = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.9
    }
  })

  try {
    if (stream) {
      const response = await fetch(`${baseUrl}:streamGenerateContent?key=${apiKey}&alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })

      if (!response.ok) {
        const error = await response.text()
        return new Response(JSON.stringify({ error: 'Gemini API error: ' + error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Pass through the SSE stream from Gemini
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    // Non-streaming
    const response = await fetch(`${baseUrl}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error: 'Gemini API error: ' + error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Gemini API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to call Gemini API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
