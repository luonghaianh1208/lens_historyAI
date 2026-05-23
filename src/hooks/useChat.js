import { useState, useRef, useCallback, useEffect } from 'react'
import { getEntity } from '../services/retrieval'
import { findPresetResponse, getNextPresetSuggestion, getUnusedPresetSuggestions } from '../services/chatPresetService'
import { parseSuggestions } from '../utils/parseSuggestions'

export function useChat(entityId, perspective = 'self') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [followUpSuggestions, setFollowUpSuggestions] = useState([])
  const messagesRef = useRef([])
  const abortControllerRef = useRef(null)
  const frameRef = useRef(null)

  const entity = getEntity(entityId)

  // Cleanup on unmount: abort in-flight requests and cancel pending animation frames
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [])

  // --- Centralized ref+state helpers to prevent mutation inconsistency ---
  // messagesRef is needed for the streaming fetch body (avoids stale closure).
  // setMessages drives React renders. Both must always stay in sync.
  const pushMessage = useCallback((msg) => {
    messagesRef.current = [...messagesRef.current, msg]
    setMessages([...messagesRef.current])
  }, [])

  const replaceLastMessage = useCallback((msg) => {
    const updated = [...messagesRef.current]
    updated[updated.length - 1] = msg
    messagesRef.current = updated
    setMessages(updated)
  }, [])

  const resetMessages = useCallback(() => {
    messagesRef.current = []
    setMessages([])
  }, [])

  const rollbackMessages = useCallback((count) => {
    messagesRef.current = messagesRef.current.slice(0, -count)
    setMessages([...messagesRef.current])
  }, [])
  // --- End helpers ---

  const sendMessage = useCallback(async (userMessage) => {
    if (!entity) {
      setError('Không tìm thấy nhân vật này')
      return
    }

    pushMessage({ role: 'user', content: userMessage, timestamp: Date.now() })
    setLoading(true)
    setFollowUpSuggestions([])
    setError(null)

    try {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()

      const presetResponse = findPresetResponse({ entityId, perspective, input: userMessage })
      if (presetResponse) {
        pushMessage({
          role: 'assistant',
          content: presetResponse.answer,
          timestamp: Date.now(),
          source: 'preset',
          audioSrc: presetResponse.audioSrc,
          presetId: presetResponse.id,
          matchType: presetResponse.matchType,
          confidence: presetResponse.confidence,
        })

        // Build follow-up suggestions after preset response (lấy tất cả preset chưa hỏi)
        const askedQuestions = messagesRef.current
          .filter(m => m.role === 'user')
          .map(m => m.content)
        const unusedPresets = getUnusedPresetSuggestions(entityId, perspective, askedQuestions, 3)
        setFollowUpSuggestions(unusedPresets.map(p => ({ text: p.question, isPreset: true })))

        setLoading(false)
        return
      }

      if (import.meta.env.DEV && !import.meta.env.VITE_NETLIFY) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        pushMessage({
          role: 'assistant',
          content: `Đây là phản hồi demo cho: "${userMessage}". Để chat thật, hãy deploy lên Netlify và set GEMINI_API_KEY trong Netlify Environment Variables.`,
          source: 'ai',
        })
        setLoading(false)
        return
      }

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          entityId,
          perspective,
          messages: messagesRef.current,
          maxTokens: 2000,
          stream: false,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()
      const rawText = data.text || ''

      const { content: cleanContent, suggestions: aiSuggestions } = parseSuggestions(rawText)

      const finalMsg = { role: 'assistant', content: cleanContent, timestamp: Date.now(), source: 'ai' }
      messagesRef.current = [...messagesRef.current, finalMsg]
      setMessages([...messagesRef.current])

      // Mix: 2 AI suggestions + 1 preset suggestion (with audio)
      const aiItems = aiSuggestions.slice(0, 2).map(text => ({ text, isPreset: false }))
      const askedQuestions = messagesRef.current
        .filter(m => m.role === 'user')
        .map(m => m.content)
      const presetSugg = getNextPresetSuggestion(entityId, perspective, askedQuestions)
      const mixedSuggestions = presetSugg
        ? [...aiItems, { text: presetSugg.question, isPreset: true }]
        : aiItems
      setFollowUpSuggestions(mixedSuggestions)
    } catch (err) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (err.name === 'AbortError') return

      console.error('Chat error:', err)
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      const shouldPopAssistant = messagesRef.current[messagesRef.current.length - 1]?.role === 'assistant'
      rollbackMessages(shouldPopAssistant ? 2 : 1)
    } finally {
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [entity, entityId, perspective, pushMessage, rollbackMessages])

  const changePerspective = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    resetMessages()
    setError(null)
    setFollowUpSuggestions([])
  }, [resetMessages])

  return { messages, loading, error, sendMessage, changePerspective, entity, setMessages, followUpSuggestions }
}
