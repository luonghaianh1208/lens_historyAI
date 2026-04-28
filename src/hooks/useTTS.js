import { useState, useCallback, useRef } from 'react'
import { buildTTSPayload, audioBufferToUrl } from '../services/ttsService'

export function useTTS() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const currentAudioRef = useRef(null)
  const abortControllerRef = useRef(null)

  const speak = useCallback(async (text, entityId) => {
    // Abort previous fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    setLoading(true)
    setPlaying(false)

    try {
      // Truncate long text to prevent timeout (server also truncates as safety net)
      let ttsText = text
      if (ttsText.length > 500) {
        const cut = ttsText.substring(0, 500)
        const lastDot = cut.lastIndexOf('.')
        ttsText = lastDot > 250 ? cut.substring(0, lastDot + 1) : cut + '...'
      }
      const payload = buildTTSPayload(ttsText, entityId)

      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      })

      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If not JSON, it's a raw 500
      }

      if (!response.ok) {
        throw new Error(data && data.error ? data.error : `TTS API error (${response.status})`);
      }

      if (!data.audioContent) {
        throw new Error('No audio content returned')
      }

      // Convert base64 to audio
      const audioData = atob(data.audioContent)
      const arrayBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(arrayBuffer)
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }

      const audioUrl = audioBufferToUrl(arrayBuffer)
      const audio = new Audio(audioUrl)

      currentAudioRef.current = audio

      audio.onplay = () => {
        setLoading(false)
        setPlaying(true)
      }

      audio.onended = () => {
        setPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setLoading(false)
        setPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('TTS error:', err)
      }
      setLoading(false)
      setPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setPlaying(false)
    setLoading(false)
  }, [])

  return { speak, stop, playing, loading }
}