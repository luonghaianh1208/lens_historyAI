import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { getEntity } from '../services/retrieval'
import { useAuth } from '../hooks/useAuth'

const perspectiveLabels = {
  self: 'Nhập vai',
  contemporary: 'Người cùng thời',
  historian: 'Sử gia'
}

const lengthLabels = {
  short: 'Ngắn',
  medium: 'Vừa',
  long: 'Dài'
}

export default function Chat() {
  const { entityId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [perspective, setPerspective] = useState(searchParams.get('perspective') || 'self')
  const [lengthLevel, setLengthLevel] = useState('medium')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const entity = getEntity(entityId)
  const { messages, loading, sendMessage, changePerspective } = useChat(entityId, perspective, lengthLevel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    changePerspective(perspective)
  }, [perspective])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const text = input
    setInput('')
    await sendMessage(text)
  }

  const handleChangePerspective = (newPerspective) => {
    if (newPerspective !== perspective) {
      setPerspective(newPerspective)
    }
  }

  const renderMessage = (content) => {
    return content
  }

  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy</h2>
          <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(`/entity/${entityId}`)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{entity.name}</h1>
            <p className="text-sm text-gray-500">{perspectiveLabels[perspective]}</p>
          </div>
          <button
            onClick={() => navigate(`/quiz/${entityId}`)}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200"
          >
            Tạo Quiz
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          {/* Perspective Selector */}
          <div className="flex gap-2">
            {Object.entries(perspectiveLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleChangePerspective(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  perspective === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Length Selector */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Độ dài:</span>
            {Object.entries(lengthLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setLengthLevel(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  lengthLevel === key
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 overflow-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-500 mb-6">Bắt đầu cuộc trò chuyện với {entity.name}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setInput('Cho ta biết về cuộc đời của người?')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                Cuộc đời
              </button>
              <button
                onClick={() => setInput('Kể về chiến công lớn nhất của người?')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                Chiến công
              </button>
              <button
                onClick={() => setInput('Người đánh giá thế nào về thời kỳ đó?')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
              >
                Đánh giá
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white shadow-sm'
                }`}
              >
                <div className="text-sm mb-1 opacity-60">
                  {msg.role === 'user' ? 'Bạn' : entity.name}
                </div>
                <div className={`leading-relaxed ${msg.role === 'user' ? '' : 'prose prose-sm max-w-none'}`}>
                  {msg.role === 'assistant'
                    ? renderMessage(msg.content || '...')
                    : msg.content}
                </div>
                {loading && msg.role === 'assistant' && !msg.content && (
                  <span className="inline-block animate-pulse">Đang trả lời...</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}