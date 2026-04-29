import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { getEntity } from '../services/retrieval'
import { useTTS } from '../hooks/useTTS'
import ReactMarkdown from 'react-markdown'

const lengthLabels = {
  short: 'Ngắn',
  medium: 'Vừa',
  long: 'Dài'
}

function getPerspectiveEntries(entity) {
  if (!entity?.perspectives) return []
  return Object.entries(entity.perspectives)
}

function getPerspectiveLabel(key, entity) {
  return entity?.perspectives?.[key]?.persona || key
}

function getSpeakerName(entity, perspective) {
  if (!entity) return 'AI'
  const config = entity.perspectives?.[perspective]
  if (!config) return entity.name

  // Với góc nhìn tự thuật: hiện tên nhân vật
  if (perspective === 'self') return entity.name

  // Với các góc nhìn khác: hiện persona label
  // Ví dụ: "Lê Lợi — chúa công", "Sử gia hiện đại"
  const persona = config.persona || ''
  return persona || entity.name
}

function getQuickSuggestions(entity, perspective) {
  if (!entity) return []

  const name = entity.name

  if (perspective === 'historian') {
    return [
      `Đánh giá vai trò của ${name} theo sử học hiện đại?`,
      `Các sử gia có quan điểm khác nhau thế nào về ${name}?`,
      `Tầm quan trọng của ${name} trong lịch sử Việt Nam?`,
    ]
  }

  if (perspective === 'self') {
    return [
      `Kể về cuộc đời của ngài?`,
      `Chiến công hay đóng góp lớn nhất của ngài là gì?`,
      `Điều gì khiến ngài tự hào nhất trong cuộc đời?`,
    ]
  }

  // contemporary — câu hỏi hướng về nhân vật chính qua góc nhìn người nói
  return [
    `Ngài nhận xét thế nào về ${name}?`,
    `${name} là người như thế nào trong mắt ngài?`,
    `Kỷ niệm đáng nhớ nhất của ngài với ${name} là gì?`,
  ]
}

export default function Chat() {
  const { entityId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const entity = getEntity(entityId)
  const perspectiveEntries = getPerspectiveEntries(entity)
  const defaultPerspective = searchParams.get('perspective') || perspectiveEntries[0]?.[0] || 'self'

  const [perspective, setPerspective] = useState(defaultPerspective)
  const [lengthLevel, setLengthLevel] = useState('medium')
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [autoPlayTTS, setAutoPlayTTS] = useState(true)
  const messagesEndRef = useRef(null)
  const mainRef = useRef(null)

  const { messages, loading, error, sendMessage, changePerspective } = useChat(entityId, perspective, lengthLevel)
  const { speak, stop, playing: ttsPlaying, loading: ttsLoading, chunkInfo } = useTTS()

  const suggestions = getQuickSuggestions(entity, perspective)
  const lastSpokenIndexRef = useRef(-1)

  // Auto-play TTS when assistant message arrives
  useEffect(() => {
    if (autoPlayTTS && !loading) {
      const lastMsgIndex = messages.length - 1
      const lastMsg = messages[lastMsgIndex]
      if (lastMsg?.role === 'assistant' && lastMsg?.content && lastSpokenIndexRef.current !== lastMsgIndex) {
        // Clean markdown for TTS (remove markdown symbols)
        const cleanText = lastMsg.content
          .replace(/[#*_`~\[\]]/g, '')
          .replace(/\n+/g, '. ')
          .trim()

        if (cleanText.length > 0) {
          lastSpokenIndexRef.current = lastMsgIndex
          speak(cleanText, entityId).catch(() => {
            // TTS failed silently, that's ok
          })
        }
      }
    }
  }, [messages, loading, autoPlayTTS])

  // Stop TTS when changing perspective
  useEffect(() => {
    stop()
  }, [perspective])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    changePerspective(perspective)
  }, [perspective])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    stop() // Stop any playing TTS
    const text = input
    setInput('')
    await sendMessage(text)
  }

  const handleChangePerspective = (newPerspective) => {
    if (newPerspective !== perspective) {
      stop()
      setPerspective(newPerspective)
    }
  }

  const handlePlayAudio = (content) => {
    if (ttsPlaying || ttsLoading) {
      stop()
    } else {
      if (content) {
        speak(content, entityId)
      }
    }
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
            <p className="text-sm text-gray-500">{getPerspectiveLabel(perspective, entity)}</p>
          </div>

          {/* Global Stop TTS Button */}
          {(ttsPlaying || ttsLoading) && (
            <button
              onClick={() => stop()}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
              title={ttsLoading ? 'Hủy tổng hợp giọng đọc' : 'Dừng âm thanh đang phát'}
            >
              {ttsLoading ? (
                <>
                  <span className="animate-spin inline-block">⏳</span>
                  {chunkInfo && chunkInfo.total > 1
                    ? ` Đoạn ${chunkInfo.current}/${chunkInfo.total}...`
                    : ' Đang tổng hợp...'
                  }
                </>
              ) : (
                <>
                  <span className="animate-pulse">⏹</span>
                  {chunkInfo && chunkInfo.total > 1
                    ? ` Đoạn ${chunkInfo.current}/${chunkInfo.total} — Dừng`
                    : ' Dừng đọc'
                  }
                </>
              )}
            </button>
          )}

          {/* TTS Auto-play Toggle */}
          <button
            onClick={() => setAutoPlayTTS(!autoPlayTTS)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${autoPlayTTS
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            title={autoPlayTTS ? 'Tắt tự động đọc' : 'Bật tự động đọc'}
          >
            <span>{autoPlayTTS ? '🔊' : '🔇'}</span> {autoPlayTTS ? 'Tự đọc: Bật' : 'Tự đọc: Tắt'}
          </button>

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
          {/* Perspective Selector — dynamic from entity data */}
          <div className="flex gap-2 flex-wrap">
            {perspectiveEntries.map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleChangePerspective(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${perspective === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {config.persona || key}
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${lengthLevel === key
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
      <main
        ref={mainRef}
        onScroll={(e) => {
          const el = e.currentTarget
          setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
        }}
        className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 overflow-auto relative"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <strong>Lỗi:</strong> {error}
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-500 mb-6">Bắt đầu cuộc trò chuyện với {entity.name}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((text, i) => (
                <button
                  key={i}
                  onClick={() => setInput(text)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-sm'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm opacity-60">
                    {msg.role === 'user' ? 'Bạn' : getSpeakerName(entity, perspective)}
                  </span>
                  {msg.role === 'assistant' && msg.content && (
                    <button
                      onClick={() => handlePlayAudio(msg.content)}
                      className={`flex items-center gap-1 text-xs transition p-1 rounded ${
                        ttsLoading ? 'opacity-80 text-blue-500' 
                        : ttsPlaying ? 'opacity-80 text-red-500' 
                        : 'opacity-60 hover:opacity-100'
                      }`}
                      title={
                        ttsLoading ? 'Đang tổng hợp...'
                        : ttsPlaying ? 'Dừng'
                        : 'Nghe'
                      }
                    >
                      {ttsLoading ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          <span className="animate-pulse">
                            {chunkInfo && chunkInfo.total > 1
                              ? `Đoạn ${chunkInfo.current}/${chunkInfo.total}...`
                              : 'Đang tổng hợp...'
                            }
                          </span>
                        </>
                      ) : ttsPlaying ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                          </svg>
                          <span>
                            {chunkInfo && chunkInfo.total > 1
                              ? `Dừng (đoạn ${chunkInfo.current}/${chunkInfo.total})`
                              : 'Dừng'
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                          </svg>
                          <span>Nghe</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                {msg.role === 'assistant' ? (
                  <div className="leading-relaxed prose prose-sm max-w-none">
                    {msg.content ? (
                      <ReactMarkdown>
                        {msg.content + (loading && i === messages.length - 1 ? ' ▋' : '')}
                      </ReactMarkdown>
                    ) : loading && i === messages.length - 1 ? (
                      <div className="flex gap-1 items-center py-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="leading-relaxed">{msg.content || ''}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />

        {showScrollBtn && (
          <button
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="fixed bottom-24 right-6 bg-white shadow-md border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 z-10"
          >
            ↓ Tin mới nhất
          </button>
        )}
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