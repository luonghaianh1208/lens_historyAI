import { useState, useCallback, useRef } from 'react'
import { buildTTSPayload, audioBufferToUrl, splitIntoChunks } from '../services/ttsService'

// Module-level cache: tồn tại suốt session, không reset khi re-render
const audioCache = new Map()

function hashText(text) {
  let h = 0
  for (let i = 0; i < Math.min(text.length, 200); i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0
  }
  return h.toString(36) + '_' + text.length
}

function cleanMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[(\d+)\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function useTTS() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [chunkInfo, setChunkInfo] = useState(null)
  const [speed, setSpeed] = useState(1)
  const currentAudioRef = useRef(null)
  const currentUtteranceRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isStoppedRef = useRef(false)

  // Fetch một chunk từ Netlify Function
  async function fetchSingleChunk(chunkText, entityId, signal) {
    const payload = buildTTSPayload(chunkText, entityId)

    // Guard: nếu không có signal thì tạo dummy
    const effectiveSignal = signal || new AbortController().signal

    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), 15000)

    const onUserAbort = () => timeoutController.abort()
    effectiveSignal.addEventListener('abort', onUserAbort)

    try {
      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: timeoutController.signal
      })
      clearTimeout(timeoutId)
      effectiveSignal.removeEventListener('abort', onUserAbort)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `TTS error ${response.status}`)
      }
      const data = await response.json()
      if (!data.audioContent) throw new Error('No audio returned')
      return data.audioContent
    } catch (e) {
      clearTimeout(timeoutId)
      effectiveSignal.removeEventListener('abort', onUserAbort)
      throw e
    }
  }

  // Fetch TẤT CẢ chunks song song (concurrency = 2 để không spam API)
  async function fetchAllChunks(textChunks, entityId, signal) {
    const total = textChunks.length
    if (total > 1) setChunkInfo({ current: 0, total, phase: 'loading' })

    const results = new Array(total).fill(null)
    const concurrency = 2

    for (let i = 0; i < total; i += concurrency) {
      if (isStoppedRef.current || signal.aborted) break

      const batch = textChunks.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map((chunk) => fetchSingleChunk(chunk, entityId, signal))
      )
      batchResults.forEach((r, bIdx) => { results[i + bIdx] = r })

      if (total > 1) {
        setChunkInfo({ current: Math.min(i + concurrency, total), total, phase: 'loading' })
      }
    }

    return results.filter(Boolean)
  }

  // Phát một base64 audio, trả về Promise khi kết thúc
  function playAudio(base64) {
    return new Promise((resolve, reject) => {
      const audioData = atob(base64)
      const buffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(buffer)
      for (let i = 0; i < audioData.length; i++) view[i] = audioData.charCodeAt(i)
      const url = audioBufferToUrl(buffer)
      const audio = new Audio(url)
      currentAudioRef.current = audio

      audio.onended = () => { URL.revokeObjectURL(url); resolve() }
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Playback error')) }

      // 60ms delay — đủ để không mất chữ đầu, ngắn hơn để liền mạch hơn
      setTimeout(() => {
        audio.playbackRate = speed
        audio.play().then(() => setPlaying(true)).catch(reject)
      }, 60)
    })
  }

  // Phát tuần tự sau khi đã có đủ audio data
  async function playChunksSequentially(audioChunks) {
    const total = audioChunks.length
    setLoading(false)

    for (let i = 0; i < audioChunks.length; i++) {
      if (isStoppedRef.current || abortControllerRef.current?.signal.aborted) break
      if (total > 1) setChunkInfo({ current: i + 1, total, phase: 'playing' })
      await playAudio(audioChunks[i])
    }
  }

  const playUrl = useCallback(async (url) => {
    if (!url) return

    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    isStoppedRef.current = false

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      currentUtteranceRef.current = null
    }

    setLoading(false)
    setPlaying(false)
    setChunkInfo(null)

    try {
      const audio = new Audio(url)
      currentAudioRef.current = audio

      await new Promise((resolve, reject) => {
        audio.onended = () => {
          setPlaying(false)
          resolve()
        }
        audio.onerror = () => {
          setPlaying(false)
          reject(new Error('Playback error'))
        }

        setTimeout(() => {
          audio.playbackRate = speed
          audio.play().then(() => setPlaying(true)).catch(reject)
        }, 30)
      })
      return true
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Preset audio error:', err)
      }
      return false
    } finally {
      currentAudioRef.current = null
      setLoading(false)
      setChunkInfo(null)
    }
  }, [speed])

  const speakLocal = useCallback(async (text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return

    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    isStoppedRef.current = false

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }

    window.speechSynthesis.cancel()
    currentUtteranceRef.current = null
    setLoading(false)
    setPlaying(false)
    setChunkInfo(null)

    try {
      await new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text)
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('vi'))
          || voices.find((voice) => /vietnam/i.test(voice.name))

        utterance.lang = preferredVoice?.lang || 'vi-VN'
        utterance.rate = speed
        utterance.pitch = 1
        utterance.volume = 1
        if (preferredVoice) utterance.voice = preferredVoice

        currentUtteranceRef.current = utterance
        utterance.onend = () => {
          currentUtteranceRef.current = null
          setPlaying(false)
          resolve()
        }
        utterance.onerror = (event) => {
          currentUtteranceRef.current = null
          setPlaying(false)
          reject(new Error(event.error || 'Speech synthesis error'))
        }

        setPlaying(true)
        window.speechSynthesis.speak(utterance)
      })
    } catch (err) {
      console.error('Preset local audio error:', err)
    } finally {
      setLoading(false)
      setChunkInfo(null)
    }
  }, [speed])

  const speak = useCallback(async (text, entityId) => {
    // Reset state
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
      // Clean markdown 1 lần duy nhất → chunk count nhất quán
      const clean = cleanMarkdown(text)
      const cacheKey = hashText(clean) + '_' + entityId

      let audioChunks = audioCache.get(cacheKey)

      if (!audioChunks) {
        // Chưa có cache → fetch tất cả chunks song song
        const textChunks = splitIntoChunks(clean, 400)
        audioChunks = await fetchAllChunks(
          textChunks, entityId, abortControllerRef.current.signal
        )
        // Lưu vào cache
        audioCache.set(cacheKey, audioChunks)
        // Giới hạn cache size: xóa entry cũ nhất nếu > 10
        if (audioCache.size > 10) {
          audioCache.delete(audioCache.keys().next().value)
        }
      } else {
        // Cache hit — phát ngay, không loading
        setLoading(false)
      }

      if (!isStoppedRef.current && audioChunks.length > 0) {
        await playChunksSequentially(audioChunks)
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
  }, [speed])

  const stop = useCallback(() => {
    isStoppedRef.current = true
    if (abortControllerRef.current) abortControllerRef.current.abort()
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      currentUtteranceRef.current = null
    }
    setPlaying(false)
    setLoading(false)
    setChunkInfo(null)
  }, [])

  return { speak, speakLocal, playUrl, stop, playing, loading, chunkInfo, speed, setSpeed }
}
