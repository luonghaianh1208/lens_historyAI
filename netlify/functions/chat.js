export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, messages, maxTokens = 1000, stream = false } = req.body

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // Convert messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))

  const model = 'gemini-2.5-flash'
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}`

  try {
    if (stream) {
      // Streaming endpoint
      const response = await fetch(`${baseUrl}:streamGenerateContent?key=${apiKey}&alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.9
          }
        })
      })

      if (!response.ok) {
        const error = await response.text()
        return res.status(500).json({ error: 'Gemini API error: ' + error })
      }

      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

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
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.9
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return res.status(500).json({ error: 'Gemini API error: ' + error })
    }

    const data = await response.json()
    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return res.status(200).json({ text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return res.status(500).json({ error: 'Failed to call Gemini API' })
  }
}