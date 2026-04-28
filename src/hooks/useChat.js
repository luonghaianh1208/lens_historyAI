import { useState, useRef, useCallback } from 'react'
import { streamClaude, buildSystemPrompt } from '../services/claudeApi'
import { getEntity } from '../services/retrieval'

export function useChat(entityId, perspective = 'self', lengthLevel = 'medium') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const entity = getEntity(entityId)

  const sendMessage = useCallback(async (userMessage) => {
    if (!entity) return

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)
    setError(null)

    try {
      const systemPrompt = buildSystemPrompt(entity, perspective, lengthLevel)
      abortRef.current = new AbortController()

      const response = await streamClaude({
        systemPrompt,
        messages: newMessages,
        maxTokens: 1000
      })

      if (!response.ok) throw new Error('API Error')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // Gemini streaming returns SSE format: "data: {...}"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
              if (text) {
                assistantMessage += text
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMessage }
                  return updated
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        setMessages(prev => prev.slice(0, -1))
      }
    } finally {
      setLoading(false)
    }
  }, [entity, messages, perspective, lengthLevel])

  const changePerspective = useCallback((newPerspective) => {
    setMessages([])
  }, [])

  return { messages, loading, error, sendMessage, changePerspective, entity }
}