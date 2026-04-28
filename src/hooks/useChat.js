import { useState, useRef, useCallback } from 'react'
import { buildSystemPrompt } from '../services/geminiApi'
import { getEntity } from '../services/retrieval'

export function useChat(entityId, perspective = 'self', lengthLevel = 'medium') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesRef = useRef([])

  const entity = getEntity(entityId)

  const sendMessage = useCallback(async (userMessage) => {
    if (!entity) {
      setError('Không tìm thấy nhân vật này')
      return
    }

    const userMsg = { role: 'user', content: userMessage }
    messagesRef.current = [...messagesRef.current, userMsg]
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const systemPrompt = buildSystemPrompt(entity, perspective, lengthLevel)

      // For local dev without Netlify function, use mock response
      if (import.meta.env.DEV && !import.meta.env.VITE_NETLIFY) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockResponse = {
          role: 'assistant',
          content: `Đây là phản hồi demo cho: "${userMessage}". Để chat thật, hãy deploy lên Netlify và set GEMINI_API_KEY.`
        }
        messagesRef.current = [...messagesRef.current, mockResponse]
        setMessages(prev => [...prev, mockResponse])
        setLoading(false)
        return
      }

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: messagesRef.current,
          maxTokens: 1000,
          stream: true
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errData.error || 'API Error: ' + response.status)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let sseBuffer = '' // Buffer to handle incomplete SSE chunks

      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Append new data to buffer
        sseBuffer += decoder.decode(value, { stream: true })

        // Process complete lines only
        const lines = sseBuffer.split('\n')
        // Keep the last potentially incomplete line in the buffer
        sseBuffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6)
            if (dataStr === '[DONE]') continue
            try {
              const data = JSON.parse(dataStr)
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
              // Skip invalid/incomplete JSON - it will be buffered for next iteration
            }
          }
        }
      }

      // Process any remaining data in the buffer
      if (sseBuffer.trim().startsWith('data: ')) {
        const dataStr = sseBuffer.trim().slice(6)
        if (dataStr !== '[DONE]') {
          try {
            const data = JSON.parse(dataStr)
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
            // Final incomplete chunk - skip
          }
        }
      }

      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: assistantMessage }]
    } catch (err) {
      console.error('Chat error:', err)
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      setMessages(prev => prev.slice(0, -1))
      messagesRef.current = messagesRef.current.slice(0, -1)
    } finally {
      setLoading(false)
    }
  }, [entity, perspective, lengthLevel])

  const changePerspective = useCallback(() => {
    setMessages([])
    messagesRef.current = []
  }, [])

  return { messages, loading, error, sendMessage, changePerspective, entity }
}