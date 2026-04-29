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
      // Làm sạch text trước khi gửi (bỏ markdown, giữ nội dung)
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // bỏ bold **text**
        .replace(/\*(.*?)\*/g, '$1')       // bỏ italic *text*
        .replace(/#{1,6}\s/g, '')          // bỏ heading #
        .replace(/\[(\d+)\]/g, '')         // bỏ citation [1][2]
        .replace(/\n{3,}/g, '\n\n')        // gộp dòng trống thừa
        .trim()

      const payload = buildTTSPayload(cleanText, entityId)

      // Thêm timeout controller riêng cho TTS (12 giây)
      const ttsController = new AbortController()
      const ttsTimeout = setTimeout(() => ttsController.abort(), 12000)

      // Lắng nghe cả user abort lẫn timeout
      const onUserAbort = () => ttsController.abort()
      abortControllerRef.current.signal.addEventListener('abort', onUserAbort)

      const response = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ttsController.signal
      })
      clearTimeout(ttsTimeout)

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

      audio.onended = () => {
        setPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = (e) => {
        setLoading(false)
        setPlaying(false)
        URL.revokeObjectURL(audioUrl)
        console.error('Audio playback error:', e)
      }

      // Gọi play — setLoading(false) ngay sau khi play() resolve
      // vì lúc này audio đã sẵn sàng
      await audio.play()
      setLoading(false)
      setPlaying(true)
    } catch (err) {
      if (err.name === 'AbortError') {
        // Phân biệt: user cancel hay timeout?
        // Nếu abortControllerRef đã bị abort → user cancel → im lặng
        // Nếu không → timeout
        if (!abortControllerRef.current?.signal?.aborted) {
          console.warn('TTS timeout — text quá dài hoặc server chậm')
        }
        // Không show error cho user
      } else {
        console.error('TTS error:', err)
      }
      setLoading(false)
      setPlaying(false)
    }
  }, [])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setPlaying(false)
    setLoading(false)
  }, [])

  return { speak, stop, playing, loading }
}