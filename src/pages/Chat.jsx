import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import { getEntity } from '../services/retrieval'
import { useTTS } from '../hooks/useTTS'
import { getBackgroundUrl, getCharacterUrl, getBgStyle } from '../services/assetService'
import ReactMarkdown from 'react-markdown'
import AnimatedBackground from '../components/AnimatedBackground'

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
  if (perspective === 'self') return entity.name
  const persona = config.persona || ''
  return persona || entity.name
}

function getQuickSuggestions(entity, perspective) {
  if (!entity) return []
  const name = entity.name
  const perspectiveConfig = entity.perspectives?.[perspective]
  const persona = perspectiveConfig?.persona || ''
  const isEvent = entity.type === 'event'

  // ===== SỬ GIA =====
  if (perspective === 'historian') {
    if (isEvent) {
      return [
        `Phân tích ý nghĩa lịch sử của ${name}?`,
        `${name} ảnh hưởng đến tiến trình lịch sử Việt Nam ra sao?`,
        `Các nguồn sử liệu khác nhau đánh giá ${name} thế nào?`,
      ]
    }
    return [
      `Đánh giá vai trò của ${name} trong lịch sử Việt Nam?`,
      `Các sử gia có quan điểm khác nhau thế nào về ${name}?`,
      `Di sản mà ${name} để lại cho hậu thế là gì?`,
    ]
  }

  // ===== TỰ THUẬT (chính nhân vật kể) =====
  if (perspective === 'self') {
    if (isEvent) {
      // Sự kiện không có "self" thông thường, nhưng phòng hờ
      return [
        `Kể lại diễn biến chính của sự kiện này?`,
        `Bước ngoặt quyết định nhất là gì?`,
        `Bài học lớn nhất rút ra từ sự kiện này?`,
      ]
    }
    // Nhân vật kể về chính mình
    const entityId = entity.id || ''
    if (entityId === 'ho-chi-minh') {
      return [
        `Thưa Bác, hành trình tìm đường cứu nước đã bắt đầu ra sao?`,
        `Bác có nhắn nhủ gì cho thế hệ trẻ hôm nay?`,
        `Khoảnh khắc nào trong cuộc đời khiến Bác xúc động nhất?`,
      ]
    }
    return [
      `Ngài hãy kể về cuộc đời và sự nghiệp của mình?`,
      `Chiến công hay đóng góp lớn nhất mà ngài tự hào là gì?`,
      `Điều gì đã thôi thúc ngài dấn thân vì đất nước?`,
    ]
  }

  // ===== SỰ KIỆN — perspective đặc biệt (viet-minh, french, le-loi, ...) =====
  if (isEvent) {
    // Ví dụ: Điện Biên Phủ → Võ Nguyên Giáp, De Castries
    // Ví dụ: Trận Bạch Đằng → Trần Hưng Đạo
    return [
      `${persona}, ngài đã trải qua ${name} như thế nào?`,
      `Quyết định khó khăn nhất của ngài trong ${name} là gì?`,
      `Khoảnh khắc nào trong ${name} khiến ngài nhớ nhất?`,
    ]
  }

  // ===== NHÂN VẬT — perspective "contemporary" (người cùng thời) =====
  // persona ví dụ: "Nguyễn Trãi — quân sư", "Quan lại triều Lý", "Người dân Việt Nam"
  const entityId = entity.id || ''

  // Trường hợp đặc biệt: Hồ Chí Minh + Người dân VN
  if (entityId === 'ho-chi-minh' && perspective === 'contemporary') {
    return [
      `Cuộc sống của người dân thay đổi thế nào nhờ Bác Hồ?`,
      `Khoảnh khắc nào khiến bạn xúc động nhất khi nhớ về Bác?`,
      `Người dân đã nghe tin Bác mất năm 1969 ra sao?`,
    ]
  }

  // Trường hợp chung: người đương thời kể về nhân vật
  return [
    `${persona}, ngài đánh giá ${name} là người thế nào?`,
    `Ngài có kỷ niệm nào đáng nhớ với ${name}?`,
    `Trong vai trò của mình, ngài đã hợp tác với ${name} ra sao?`,
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
        const cleanText = lastMsg.content
          .replace(/[#*_`~\[\]]/g, '')
          .replace(/\n+/g, '. ')
          .trim()
        if (cleanText.length > 0) {
          lastSpokenIndexRef.current = lastMsgIndex
          speak(cleanText, entityId).catch(() => {})
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
    stop()
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--clr-paper)' }}>
        <div className="text-center card-ancient p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Không tìm thấy</h2>
          <button onClick={() => navigate('/')} className="hover:underline" style={{ color: 'var(--clr-vermillion)' }}>Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--clr-paper)' }}>

      {/* ===== HOẠT ẢNH NỀN ===== */}
      <AnimatedBackground entityId={entityId} />

      {/* Ảnh nền mờ phía sau */}
      <div className="fixed inset-0 z-0 opacity-10"
        style={{ ...getBgStyle(entityId), filter: 'blur(3px) saturate(0.6)' }} />
      <div className="fixed inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, rgba(245,239,224,0.93) 0%, rgba(232,220,200,0.90) 100%)' }} />

      {/* Decorative top band */}
      <div className="h-0.5 w-full relative z-10" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade))' }} />

      {/* ===== HEADER ===== */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(245,239,224,0.95)', borderBottom: '1px solid rgba(184,134,11,0.25)', backdropFilter: 'blur(8px)' }}>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/entity/${entityId}`)} className="p-2 transition" style={{ color: 'var(--clr-gold)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-gold)'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{entity.name}</h1>
            <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{getPerspectiveLabel(perspective, entity)}</p>
          </div>
        </div>

        {/* TTS Controls */}
        <div className="flex items-center gap-2">
          {(ttsPlaying || ttsLoading) && (
            <button
              onClick={() => stop()}
              className="px-3 py-1.5 text-sm font-medium flex items-center gap-1 transition"
              style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '2px', color: 'var(--clr-vermillion)' }}
            >
              {ttsLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {chunkInfo && chunkInfo.total > 1 ? ` Đoạn ${chunkInfo.current}/${chunkInfo.total}...` : ' Đang tổng hợp...'}
                </>
              ) : (
                <>
                  <span className="animate-pulse">⏹</span>
                  {chunkInfo && chunkInfo.total > 1 ? ` Đoạn ${chunkInfo.current}/${chunkInfo.total} — Dừng` : ' Dừng đọc'}
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setAutoPlayTTS(!autoPlayTTS)}
            className="px-3 py-1.5 text-sm font-medium transition flex items-center gap-1"
            style={{
              background: autoPlayTTS ? 'rgba(45,106,79,0.15)' : 'transparent',
              border: `1px solid ${autoPlayTTS ? 'rgba(45,106,79,0.4)' : 'rgba(184,134,11,0.3)'}`,
              borderRadius: '2px',
              color: autoPlayTTS ? 'var(--clr-jade)' : 'var(--clr-ink-soft)',
            }}
          >
            <span>{autoPlayTTS ? '🔊' : '🔇'}</span> {autoPlayTTS ? 'Tự đọc: Bật' : 'Tự đọc: Tắt'}
          </button>

          <button
            onClick={() => navigate(`/quiz/${entityId}`)}
            className="px-4 py-1.5 text-sm font-medium transition"
            style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-gold)' }}
          >
            Tạo Quiz
          </button>
        </div>
      </header>

      {/* ===== CONTROLS ===== */}
      <div className="relative z-10 px-4 py-2 flex flex-wrap gap-4 items-center justify-between"
        style={{ background: 'rgba(232,220,200,0.5)', borderBottom: '1px solid rgba(184,134,11,0.15)' }}>

        <div className="flex gap-2 flex-wrap">
          {perspectiveEntries.map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleChangePerspective(key)}
              className="px-3 py-1.5 text-sm font-medium transition"
              style={{
                fontFamily: 'var(--font-serif)',
                ...(perspective === key
                  ? { background: 'var(--clr-vermillion)', color: 'white', borderRadius: '2px' }
                  : { background: 'transparent', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px' }
                ),
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
              onClick={() => setLengthLevel(key)}
              className="px-3 py-1 text-xs font-medium transition"
              style={{
                fontFamily: 'var(--font-serif)',
                ...(lengthLevel === key
                  ? { background: 'var(--clr-ink)', color: 'var(--clr-paper)', borderRadius: '2px' }
                  : { background: 'transparent', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.2)', borderRadius: '2px' }
                ),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== MAIN — 2 columns on desktop ===== */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* CHARACTER SIDEBAR — desktop only */}
        <aside className="hidden md:flex w-52 flex-col items-center justify-end pb-0 px-2 flex-shrink-0"
          style={{ background: 'rgba(245,239,224,0.6)' }}>
          <div className="character-vignette character-stage relative">
            <div className="character-floor" />
            <img
              src={getCharacterUrl(entityId)}
              alt={entity.name}
              className="character-blend character-hero relative z-10"
              style={{
                height: 'min(60vh, 480px)',
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                display: 'block',
              }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>
          <div className="mt-2 mb-3 text-center">
            <p className="text-xs font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
              {getSpeakerName(entity, perspective)}
            </p>
            <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
          </div>
        </aside>

        {/* ===== CHAT AREA ===== */}
        <main
          ref={mainRef}
          onScroll={(e) => {
            const el = e.currentTarget
            setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100)
          }}
          className="flex-1 overflow-auto px-4 py-4 space-y-4"
        >
          {error && (
            <div className="mb-4 p-4 text-sm" style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '2px', color: 'var(--clr-vermillion)' }}>
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="mb-6" style={{ color: 'var(--clr-ink-soft)' }}>Bắt đầu cuộc trò chuyện với {entity.name}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((text, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(text)}
                    className="px-4 py-2 text-sm transition"
                    style={{ fontFamily: 'var(--font-serif)', background: 'rgba(245,239,224,0.9)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-ink-soft)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)' }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-xl px-4 py-3 ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                  {msg.role === 'assistant' && (
                    <p className="text-xs mb-1 font-medium" style={{ color: 'var(--clr-gold)' }}>
                      {getSpeakerName(entity, perspective)}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs opacity-50" style={{ color: 'var(--clr-ink)' }}>
                      {msg.role === 'user' ? 'Bạn' : ''}
                    </span>
                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => handlePlayAudio(msg.content)}
                        className="text-xs p-1 transition"
                        style={{ color: ttsPlaying || ttsLoading ? 'var(--clr-vermillion)' : 'var(--clr-gold)', opacity: 0.7 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                      >
                        {ttsPlaying ? '⏹' : '🔊'}
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
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--clr-gold)', animationDelay: '300ms' }} />
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
              className="fixed bottom-24 right-6 px-4 py-2 text-sm transition z-10"
              style={{ background: 'var(--clr-paper)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-gold)', boxShadow: '0 2px 8px rgba(26,15,10,0.1)' }}
            >
              ↓ Tin mới nhất
            </button>
          )}
        </main>
      </div>

      {/* ===== INPUT BAR ===== */}
      <div className="relative z-10 px-4 py-3"
        style={{ background: 'rgba(245,239,224,0.97)', borderTop: '1px solid rgba(184,134,11,0.2)' }}>
        <form onSubmit={handleSend} className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
            className="flex-1 px-4 py-3 outline-none"
            style={{
              background: 'rgba(245,239,224,0.95)',
              border: '1px solid rgba(184,134,11,0.4)',
              borderRadius: '2px',
              fontFamily: 'var(--font-serif)',
              color: 'var(--clr-ink)',
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary"
          >
            {loading ? '...' : 'Gửi'}
          </button>
        </form>
      </div>
    </div>
  )
}