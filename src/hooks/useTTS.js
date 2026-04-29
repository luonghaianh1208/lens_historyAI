import { useState, useCallback, useRef } from 'react'
import { buildTTSPayload, audioBufferToUrl, splitIntoChunks } from '../services/ttsService'

export function useTTS() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [chunkInfo, setChunkInfo] = useState(null) // { current, total }
  const currentAudioRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isStoppedRef = useRef(false)

  // Fetch một chunk từ Netlify Function
  async function fetchChunk(chunkText, entityId, signal) {
    const cleanText = chunkText
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[(\d+)\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    const payload = buildTTSPayload(cleanText, entityId)

    // Timeout riêng cho mỗi chunk: 15s (chunk nhỏ hơn nên đủ)
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), 15000)

    // Lắng nghe cả user abort lẫn timeout
    const onUserAbort = () => timeoutController.abort()
    signal.addEventListener('abort', onUserAbort)

    try {
      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: timeoutController.signal
      })
      clearTimeout(timeoutId)
      signal.removeEventListener('abort', onUserAbort)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `TTS API error ${response.status}`)
      }

      const data = await response.json()
      if (!data.audioContent) throw new Error('No audio returned')
      return data.audioContent
    } catch (e) {
      clearTimeout(timeoutId)
      signal.removeEventListener('abort', onUserAbort)
      throw e
    }
  }

  // Phát một base64 audio string, trả về Promise khi kết thúc
  function playAudio(base64) {
    return new Promise((resolve, reject) => {
      const audioData = atob(base64)
      const buffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }
      const url = audioBufferToUrl(buffer)
      const audio = new Audio(url)
      currentAudioRef.current = audio

      audio.onended = () => { URL.revokeObjectURL(url); resolve() }
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Playback error')) }

      // Delay nhỏ trước khi play để tránh mất chữ đầu
      setTimeout(() => {
        audio.play().then(() => {
          setLoading(false)
          setPlaying(true)
        }).catch(reject)
      }, 80)
    })
  }

  const speak = useCallback(async (text, entityId) => {
    // Reset
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    isStoppedRef.current = false

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    setLoading(true)
    setPlaying(false)
    setChunkInfo(null)

    try {
      const chunks = splitIntoChunks(text, 400)
      const total = chunks.length

      if (total > 1) {
        setChunkInfo({ current: 1, total })
      }

      for (let i = 0; i < chunks.length; i++) {
        // Kiểm tra đã stop chưa
        if (isStoppedRef.current || abortControllerRef.current.signal.aborted) break

        if (total > 1) setChunkInfo({ current: i + 1, total })

        // Fetch chunk
        const base64 = await fetchChunk(
          chunks[i],
          entityId,
          abortControllerRef.current.signal
        )

        if (isStoppedRef.current || abortControllerRef.current.signal.aborted) break

        // Phát chunk — chờ kết thúc trước khi fetch chunk tiếp theo
        await playAudio(base64)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('TTS error:', err)
      }
    } finally {
      setLoading(false)
      setPlaying(false)
      setChunkInfo(null)
    }
  }, [])

  const stop = useCallback(() => {
    isStoppedRef.current = true
    if (abortControllerRef.current) abortControllerRef.current.abort()
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setPlaying(false)
    setLoading(false)
    setChunkInfo(null)
  }, [])

  return { speak, stop, playing, loading, chunkInfo }
}