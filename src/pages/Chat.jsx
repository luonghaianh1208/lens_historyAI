import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import AnimatedBackground from '../components/AnimatedBackground'
import { useChat } from '../hooks/useChat'
import { getEntity } from '../services/retrieval'
import { useTTS } from '../hooks/useTTS'
import { getCharacterUrl, getBgStyle } from '../services/assetService'

const lengthLabels = {
  short: 'Ngắn',
  medium: 'Vừa',
  long: 'Dài',
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
  if (perspective === 'self') return entity.name
  return config.persona || entity.name
}

function getQuickSuggestions(entity, perspective) {
  if (!entity) return []
  const name = entity.name
  const persona = entity.perspectives?.[perspective]?.persona || ''
  const isEvent = entity.type === 'event'

  if (perspective === 'historian') {
    return isEvent
      ? [
          `Phân tích ý nghĩa lịch sử của ${name}.`,
          `${name} đã thay đổi tiến trình lịch sử Việt Nam ra sao?`,
          `Những nguồn sử liệu khác nhau đánh giá ${name} thế nào?`,
        ]
      : [
          `Đánh giá vai trò của ${name} trong lịch sử Việt Nam.`,
          `Những tranh luận sử học lớn quanh ${name} là gì?`,
          `Di sản lớn nhất mà ${name} để lại là gì?`,
        ]
  }

  if (perspective === 'self') {
    return isEvent
      ? [
          `Kể lại diễn biến chính của sự kiện này.`,
          `Bước ngoặt quyết định nhất là gì?`,
          `Bài học lớn nhất rút ra từ sự kiện này là gì?`,
        ]
      : [
          `Ngài hãy kể về cuộc đời và sự nghiệp của mình.`,
          `Điều gì đã thôi thúc ngài dấn thân vì đất nước?`,
          `Khoảnh khắc nào khiến ngài nhớ nhất trong đời mình?`,
        ]
  }

  if (isEvent) {
    return [
      `${persona}, ngài đã trải qua ${name} như thế nào?`,
      `Quyết định khó khăn nhất của ngài trong ${name} là gì?`,
      `Khoảnh khắc nào trong ${name} khiến ngài nhớ nhất?`,
    ]
  }

  return [
    `${persona}, ngài đánh giá ${name} là người thế nào?`,
    `Ngài có kỷ niệm nào đáng nhớ với ${name}?`,
    `Trong vai trò của mình, ngài đã hợp tác với ${name} ra sao?`,
  ]
}

const MessageBubble = memo(function MessageBubble({
  msg,
  isStreaming,
  speakerName,
  onPlayAudio,
  ttsActive,
}) {
  return (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
      <div className={`max-w-2xl px-4 py-3 ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
        {msg.role === 'assistant' && (
          <p className="text-xs mb-1 font-medium" style={{ color: 'var(--clr-gold)' }}>
            {speakerName}
          </p>
        )}

        <div className="flex items-center justify-between mb-1 gap-4">
          <span className="text-xs opacity-60" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.82)' : 'var(--clr-ink)' }}>
            {msg.role === 'user' ? 'Bạn' : 'Phản hồi'}
          </span>

          {msg.role === 'assistant' && msg.content && (
            <button
              type="button"
              onClick={() => onPlayAudio(msg.content)}
              className="ghost-icon-button text-xs p-1"
              style={{ color: ttsActive ? 'var(--clr-vermillion)' : 'var(--clr-gold)', opacity: 0.8 }}
              aria-label="Phát âm thanh"
            >
              {ttsActive ? '⏹' : '🔊'}
            </button>
          )}
        </div>

        {msg.role === 'assistant' ? (
          <div className="leading-relaxed prose prose-sm max-w-none">
            {msg.content ? (
              <ReactMarkdown>{msg.content + (isStreaming ? ' ▋' : '')}</ReactMarkdown>
            ) : (
              <div className="flex gap-1 items-center py-1">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        ) : (
          <div className="leading-relaxed">{msg.content || ''}</div>
        )}
      </div>
    </div>
  )
})

export default function Chat() {
  const { entityId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const entity = getEntity(entityId)
  const perspectiveEntries = useMemo(() => getPerspectiveEntries(entity), [entity])
  const initialPerspective = searchParams.get('perspective') || perspectiveEntries[0]?.[0] || 'self'

  const [perspective, setPerspective] = useState(initialPerspective)
  const [lengthLevel, setLengthLevel] = useState('medium')
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [autoPlayTTS, setAutoPlayTTS] = useState(true)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  const messagesEndRef = useRef(null)
  const mainRef = useRef(null)
  const lastSpokenIndexRef = useRef(-1)

  const { messages, loading, error, sendMessage, changePerspective } = useChat(entityId, perspective, lengthLevel)
  const { speak, stop, playing: ttsPlaying, loading: ttsLoading, chunkInfo } = useTTS()
  const suggestions = useMemo(() => getQuickSuggestions(entity, perspective), [entity, perspective])

  useEffect(() => {
    if (autoPlayTTS && !loading) {
      const lastMsgIndex = messages.length - 1
      const lastMsg = messages[lastMsgIndex]
      if (lastMsg?.role === 'assistant' && lastMsg?.content && lastSpokenIndexRef.current !== lastMsgIndex) {
        const cleanText = lastMsg.content.replace(/[#*_`~\[\]]/g, '').replace(/\n+/g, '. ').trim()
        if (cleanText.length > 0) {
          lastSpokenIndexRef.current = lastMsgIndex
          speak(cleanText, entityId).catch(() => {})
        }
      }
    }
  }, [messages, loading, autoPlayTTS, speak, entityId])

  useEffect(() => {
    stop()
  }, [perspective, stop])

  useEffect(() => {
    if (isPinnedToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isPinnedToBottom])

  useEffect(() => {
    changePerspective(perspective)
    lastSpokenIndexRef.current = -1
  }, [perspective, changePerspective])

  const handleScroll = (event) => {
    const el = event.currentTarget
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const pinned = distanceToBottom < 100
    setIsPinnedToBottom(pinned)
    setShowScrollBtn(!pinned)
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!input.trim() || loading) return
    stop()
    const text = input.trim()
    setInput('')
    await sendMessage(text)
  }

  const handleSuggestionClick = async (text) => {
    if (loading) return
    stop()
    setInput('')
    await sendMessage(text)
  }

  const handlePlayAudio = (content) => {
    if (ttsPlaying || ttsLoading) {
      stop()
      return
    }
    if (content) speak(content, entityId)
  }

  if (!entity) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--clr-paper)' }}>
        <div className="interactive-surface text-center card-ancient p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Không tìm thấy</h2>
          <button type="button" onClick={() => navigate('/')} className="hover:underline" style={{ color: 'var(--clr-vermillion)' }}>Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell h-screen flex flex-col overflow-hidden" style={{ background: 'var(--clr-paper)' }}>
      <AnimatedBackground entityId={entityId} mode="quiet" />

      <div className="fixed inset-0 z-0 opacity-10" style={{ ...getBgStyle(entityId), filter: 'blur(2px) saturate(0.55)' }} />
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(135deg, rgba(245,239,224,0.94) 0%, rgba(232,220,200,0.91) 100%)' }} />

      <div className="interactive-surface h-full flex flex-col">
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade))' }} />

        <header className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 glass-panel border-b" style={{ borderColor: 'rgba(184,134,11,0.22)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(`/entity/${entityId}`)}
              className="ghost-icon-button p-2 rounded-sm"
              style={{ color: 'var(--clr-gold)' }}
              aria-label="Quay lại hồ sơ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{entity.name}</h1>
              <p className="text-xs truncate" style={{ color: 'var(--clr-gold)' }}>{getPerspectiveLabel(perspective, entity)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(ttsPlaying || ttsLoading) && (
              <button
                type="button"
                onClick={stop}
                className="px-3 py-1.5 text-sm font-medium flex items-center gap-1 rounded-sm"
                style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--clr-vermillion)' }}
              >
                <span>{ttsLoading ? '⏳' : '⏹'}</span>
                {chunkInfo?.total > 1
                  ? `${chunkInfo.current}/${chunkInfo.total} ${ttsLoading ? 'đang tải' : 'đang phát'}`
                  : ttsLoading ? 'Đang tổng hợp...' : 'Dừng đọc'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setAutoPlayTTS((value) => !value)}
              className="filter-chip px-3 py-1.5 text-sm font-medium flex items-center gap-1 rounded-sm"
              style={{
                background: autoPlayTTS ? 'rgba(45,106,79,0.15)' : 'transparent',
                border: `1px solid ${autoPlayTTS ? 'rgba(45,106,79,0.4)' : 'rgba(184,134,11,0.3)'}`,
                color: autoPlayTTS ? 'var(--clr-jade)' : 'var(--clr-ink-soft)',
              }}
            >
              <span>{autoPlayTTS ? '🔊' : '🔇'}</span>
              {autoPlayTTS ? 'Tự đọc: Bật' : 'Tự đọc: Tắt'}
            </button>

            <button type="button" onClick={() => navigate(`/quiz/${entityId}`)} className="btn-ghost text-sm">
              Tạo Quiz
            </button>
          </div>
        </header>

        <div className="px-4 py-3 flex flex-wrap gap-4 items-center justify-between border-b glass-panel" style={{ borderColor: 'rgba(184,134,11,0.15)' }}>
          <div className="flex gap-2 flex-wrap">
            {perspectiveEntries.map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPerspective(key)}
                className="filter-chip px-3 py-1.5 text-sm font-medium rounded-sm"
                style={{
                  fontFamily: 'var(--font-serif)',
                  ...(perspective === key
                    ? { background: 'var(--clr-vermillion)', color: '#fff', border: '1px solid transparent' }
                    : { background: 'transparent', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.25)' }),
                }}
              >
                {config.persona || key}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>Độ dài:</span>
            {Object.entries(lengthLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setLengthLevel(key)}
                className="filter-chip px-3 py-1 text-xs font-medium rounded-sm"
                style={{
                  fontFamily: 'var(--font-serif)',
                  ...(lengthLevel === key
                    ? { background: 'var(--clr-ink)', color: 'var(--clr-paper)', border: '1px solid transparent' }
                    : { background: 'transparent', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.2)' }),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-layout flex-1 overflow-hidden px-2 md:px-0">
          <aside className="hidden md:flex flex-col items-center justify-end pb-0 px-3 border-r" style={{ borderColor: 'rgba(184,134,11,0.12)', background: 'rgba(245,239,224,0.55)' }}>
            <div className="character-vignette character-stage relative">
              <div className="character-floor" />
              <img
                src={getCharacterUrl(entityId)}
                alt={entity.name}
                className="character-blend character-hero relative z-10"
                style={{ height: 'min(54vh, 420px)', width: 'auto', objectFit: 'contain', objectPosition: 'bottom center', display: 'block' }}
                loading="eager"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div className="mt-2 mb-4 text-center">
              <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                {getSpeakerName(entity, perspective)}
              </p>
              <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
            </div>
          </aside>

          <main ref={mainRef} onScroll={handleScroll} className="chat-thread overflow-auto px-2 md:px-6 py-4">
            {error && (
              <div className="mb-4 p-4 text-sm rounded-sm" style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--clr-vermillion)' }}>
                <strong>Lỗi:</strong> {error}
              </div>
            )}

            {messages.length === 0 && (
              <div className="max-w-3xl mx-auto py-8">
                <div className="card-ancient p-6 mb-5">
                  <p className="section-kicker mb-2">Bắt đầu cuộc trò chuyện</p>
                  <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                    Hỏi {getSpeakerName(entity, perspective)} theo cách tự nhiên
                  </h2>
                  <p style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                    Chạm vào một gợi ý để gửi ngay, hoặc tự đặt câu hỏi riêng của bạn.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestions.map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleSuggestionClick(text)}
                      className="chip-button px-4 py-3 text-sm rounded-sm text-left"
                      style={{ fontFamily: 'var(--font-serif)', background: 'rgba(245,239,224,0.9)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--clr-ink-soft)' }}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={`${msg.role}-${index}`}
                  msg={msg}
                  isStreaming={loading && index === messages.length - 1}
                  speakerName={getSpeakerName(entity, perspective)}
                  onPlayAudio={handlePlayAudio}
                  ttsActive={ttsPlaying || ttsLoading}
                />
              ))}
            </div>

            <div ref={messagesEndRef} />

            {showScrollBtn && (
              <button
                type="button"
                onClick={() => {
                  setIsPinnedToBottom(true)
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                }}
                className="fixed bottom-24 right-6 px-4 py-2 text-sm rounded-sm z-10"
                style={{ background: 'var(--clr-paper)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--clr-gold)', boxShadow: '0 2px 8px rgba(26,15,10,0.1)' }}
              >
                ↓ Tin mới nhất
              </button>
            )}
          </main>
        </div>

        <div className="px-4 py-3 glass-panel border-t" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
          <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
              className="flex-1 px-4 py-3 outline-none"
              style={{ background: 'rgba(245,239,224,0.95)', border: '1px solid rgba(184,134,11,0.4)', borderRadius: '2px', fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary">
              {loading ? '...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
