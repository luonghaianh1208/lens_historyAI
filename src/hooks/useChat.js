import { useState, useRef, useCallback } from 'react'
import { buildSystemPrompt } from '../services/geminiApi'
import { getEntity } from '../services/retrieval'
import { findPresetResponse } from '../services/chatPresetService'

export function useChat(entityId, perspective = 'self', lengthLevel = 'medium') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesRef = useRef([])
  const abortControllerRef = useRef(null)
  const frameRef = useRef(null)

  const entity = getEntity(entityId)

  const sendMessage = useCallback(async (userMessage) => {
    if (!entity) {
      setError('Không tìm thấy nhân vật này')
      return
    }

    const userMsg = { role: 'user', content: userMessage, timestamp: Date.now() }
    messagesRef.current = [...messagesRef.current, userMsg]
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()

      const presetResponse = findPresetResponse({ entityId, perspective, input: userMessage })
      if (presetResponse) {
        const assistantMsg = {
          role: 'assistant',
          content: presetResponse.answer,
          timestamp: Date.now(),
          source: 'preset',
          audioSrc: presetResponse.audioSrc,
          presetId: presetResponse.id,
          matchType: presetResponse.matchType,
          confidence: presetResponse.confidence,
        }

        messagesRef.current = [...messagesRef.current, assistantMsg]
        setMessages((prev) => [...prev, assistantMsg])
        setLoading(false)
        return
      }

      const systemPrompt = buildSystemPrompt(entity, perspective, lengthLevel)

      if (import.meta.env.DEV && !import.meta.env.VITE_NETLIFY) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const mockResponse = {
          role: 'assistant',
          content: `Đây là phản hồi demo cho: "${userMessage}". Để chat thật, hãy deploy lên Netlify và set GEMINI_API_KEY trong Netlify Environment Variables.`,
          source: 'ai',
        }
        messagesRef.current = [...messagesRef.current, mockResponse]
        setMessages((prev) => [...prev, mockResponse])
        setLoading(false)
        return
      }

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: messagesRef.current,
          maxTokens: { short: 800, medium: 2000, long: 3500 }[lengthLevel] || 2000,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || `API Error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let sseBuffer = ''
      let pendingText = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const flushAssistantMessage = (force = false) => {
        if (!pendingText && !force) return
        const nextValue = assistantMessage + pendingText
        pendingText = ''
        assistantMessage = nextValue

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: nextValue, source: 'ai' }
          return updated
        })
      }

      const scheduleFlush = () => {
        if (frameRef.current) return
        frameRef.current = requestAnimationFrame(() => {
          frameRef.current = null
          flushAssistantMessage()
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine.startsWith('data: ')) continue

          const dataStr = trimmedLine.slice(6)
          if (dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (text) {
              pendingText += text
              scheduleFlush()
            }
          } catch {
            // Ignore incomplete chunks.
          }
        }
      }

      if (sseBuffer.trim().startsWith('data: ')) {
        const dataStr = sseBuffer.trim().slice(6)
        if (dataStr !== '[DONE]') {
          try {
            const data = JSON.parse(dataStr)
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
            if (text) pendingText += text
          } catch {
            // Ignore final incomplete chunk.
          }
        }
      }

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      flushAssistantMessage(true)
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: assistantMessage, timestamp: Date.now(), source: 'ai' }]
    } catch (err) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      if (err.name === 'AbortError') return

      console.error('Chat error:', err)
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      const shouldPopAssistant = messagesRef.current[messagesRef.current.length - 1]?.role === 'assistant'
      setMessages((prev) => prev.slice(0, shouldPopAssistant ? -2 : -1))
      messagesRef.current = messagesRef.current.slice(0, shouldPopAssistant ? -2 : -1)
    } finally {
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [entity, entityId, perspective, lengthLevel])

  const changePerspective = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    setMessages([])
    messagesRef.current = []
    setError(null)
  }, [])

  return { messages, loading, error, sendMessage, changePerspective, entity, setMessages }
}
