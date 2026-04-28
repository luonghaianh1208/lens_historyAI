// Netlify Function for Gemini TTS
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { text, voiceName } = await req.json()

  const apiKey = Netlify.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
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

  const payload = {
    contents: [
      {
        parts: [
          { text: text }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            // "Puck", "Charon", "Kore", "Fenrir", "Aoede"
            voiceName: voiceName || "Puck"
          }
        }
      }
    }
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error: 'Gemini TTS API error: ' + error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()

    // Gemini AUDIO responses have inlineData: { mimeType: "audio/pcm;rate=24000", data: "<base64>" }
    const parts = data?.candidates?.[0]?.content?.parts || []
    const audioPart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio/pcm'))

    if (!audioPart) {
      return new Response(JSON.stringify({ error: 'Gemini did not return audio' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Convert Base64 PCM to a WAV format string
    const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + pcmBuffer.length, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write("data", 36);
    header.writeUInt32LE(pcmBuffer.length, 40);

    const wavBuffer = Buffer.concat([header, pcmBuffer]);

    // Return the base64 WAV data to client
    return new Response(JSON.stringify({
      audioContent: wavBuffer.toString('base64'),
      mimeType: 'audio/wav'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Gemini TTS error:', error)
    return new Response(JSON.stringify({ error: 'Failed to synthesize speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}