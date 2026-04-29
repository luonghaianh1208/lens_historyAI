// Netlify Function for Gemini TTS
export default async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { text, voiceName } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY || (typeof Netlify !== 'undefined' && Netlify.env.get('GEMINI_API_KEY'));
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

    // Truncate text to prevent timeout (Netlify free tier = 10s, ~900 chars is safe margin)
    const MAX_TTS_CHARS = 900
    let ttsText = text
    if (ttsText.length > MAX_TTS_CHARS) {
      // Tìm điểm cắt tự nhiên: ưu tiên cuối đoạn văn, rồi cuối câu
      const truncated = ttsText.substring(0, MAX_TTS_CHARS)
      const lastParagraph = truncated.lastIndexOf('\n\n')
      const lastSentence = Math.max(
        truncated.lastIndexOf('。'),
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?')
      )
      if (lastParagraph > MAX_TTS_CHARS * 0.6) {
        ttsText = truncated.substring(0, lastParagraph).trim()
      } else if (lastSentence > MAX_TTS_CHARS * 0.5) {
        ttsText = truncated.substring(0, lastSentence + 1).trim()
      } else {
        ttsText = truncated.trim()
      }
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: ttsText }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              // "Puck", "Charon", "Kore", "Fenrir", "Aoede" // Nguyễn Trãi nam thì chọn Puck
              voiceName: voiceName || "Puck"
            }
          }
        }
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`
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

    const parts = data?.candidates?.[0]?.content?.parts || []
    const audioPart = parts.find(p => p.inlineData && (p.inlineData.mimeType.startsWith('audio/pcm') || p.inlineData.mimeType.startsWith('audio/l16')))

    if (!audioPart) {
      return new Response(JSON.stringify({ error: 'Gemini did not return audio', data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Convert Base64 PCM to a WAV format string
    let pcmBuffer;
    if (typeof Buffer !== 'undefined') {
      pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    } else {
      // Deno/Edge compatibility
      const binaryString = atob(audioPart.inlineData.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      pcmBuffer = bytes;
    }

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    // Create WAV Header using TypedArray to be safe in all JS environments (Node, Deno, Edge)
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // "RIFF"
    view.setUint8(0, 82); view.setUint8(1, 73); view.setUint8(2, 70); view.setUint8(3, 70);
    view.setUint32(4, 36 + pcmBuffer.length, true);
    // "WAVE"
    view.setUint8(8, 87); view.setUint8(9, 65); view.setUint8(10, 86); view.setUint8(11, 69);
    // "fmt "
    view.setUint8(12, 102); view.setUint8(13, 109); view.setUint8(14, 116); view.setUint8(15, 32);
    view.setUint32(16, 16, true); // PCM format block size
    view.setUint16(20, 1, true); // Audio format 1=PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data"
    view.setUint8(36, 100); view.setUint8(37, 97); view.setUint8(38, 116); view.setUint8(39, 97);
    view.setUint32(40, pcmBuffer.length, true);

    const wavBytes = new Uint8Array(44 + pcmBuffer.length);
    wavBytes.set(new Uint8Array(header), 0);
    wavBytes.set(pcmBuffer, 44);

    let base64Audio = '';
    if (typeof Buffer !== 'undefined') {
      base64Audio = Buffer.from(wavBytes).toString('base64');
    } else {
      let binary = '';
      const len = wavBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(wavBytes[i]);
      }
      base64Audio = btoa(binary);
    }

    return new Response(JSON.stringify({
      audioContent: base64Audio,
      mimeType: 'audio/wav'
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: `Serverless Function Error: ${error.message || error}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}