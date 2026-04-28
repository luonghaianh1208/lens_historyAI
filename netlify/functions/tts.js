// Netlify Function for Google Cloud TTS
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { text, voiceName, locale, speakingRate, pitch } = await req.json()

  const apiKey = Netlify.env.get('GOOGLE_CLOUD_TTS_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'TTS API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!text) {
    return new Response(JSON.stringify({ error: 'Text is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const body = JSON.stringify({
    input: { text },
    voice: {
      languageCode: locale || 'vi-VN',
      name: voiceName || 'vi-VN-Standard-A'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: speakingRate || 1.0,
      pitch: pitch || 0,
      sampleRateHertz: 24000
    }
  })

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error: 'TTS API error: ' + error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    // Return base64 audio for client to decode
    return new Response(JSON.stringify({ audioContent: data.audioContent }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('TTS error:', error)
    return new Response(JSON.stringify({ error: 'Failed to synthesize speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}