import { useState, useCallback, useRef } from 'react'

export function useTTS() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [chunkInfo, setChunkInfo] = useState(null)
  const [speed, setSpeed] = useState(1)
  const currentAudioRef = useRef(null)
  const currentUtteranceRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isStoppedRef = useRef(false)


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

  return { speakLocal, playUrl, stop, playing, loading, chunkInfo, speed, setSpeed }
}
