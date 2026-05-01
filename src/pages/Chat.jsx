import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import AnimatedBackground from '../components/AnimatedBackground'
import { useChat } from '../hooks/useChat'
import { getEntity } from '../services/retrieval'
import { useTTS } from '../hooks/useTTS'
import { useLocalStorage } from "../hooks/useLocalStorage"
import { toastSuccess } from "../components/Toast"
import { getPerspectiveCharacterUrl, getBgStyle } from '../services/assetService'
import { getQuickSuggestions, hasPresetAudio } from '../services/chatPresetService'

const TTS_SPEEDS = [{ value: 0.75, label: "0.75x" }, { value: 1, label: "1x" }, { value: 1.25, label: "1.25x" }, { value: 1.5, label: "1.5x" }]



function formatTime(ts){if(!ts)return"";const d=new Date(ts);return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0")}

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

const MessageBubble = memo(function MessageBubble({
  msg,
  isStreaming,
  speakerName,
  onPlayAudio,
  ttsActive,
}) {
  const canPlayAudio = hasPresetAudio(msg)
  const responseLabel = msg.role === 'user'
    ? 'Bạn'
    : msg.source === 'preset'
      ? 'Câu trả lời mẫu'
      : 'Phản hồi AI'

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
            {responseLabel}
          </span>
          {msg.timestamp && <span className="message-time">{formatTime(msg.timestamp)}</span>}

          {msg.role === 'assistant' && msg.content && (
            <span className="flex items-center gap-1">
              {canPlayAudio && (
                <button
                  type="button"
                  onClick={() => onPlayAudio(msg)}
                  className="ghost-icon-button text-xs p-1"
                  style={{ color: ttsActive ? 'var(--clr-vermillion)' : 'var(--clr-gold)', opacity: 0.8 }}
                  aria-label="Phát âm thanh"
                >
                  {ttsActive ? '⏹' : '🔊'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(msg.content) }}
                className="ghost-icon-button text-xs p-1 copy-btn"
                style={{ color: 'var(--clr-gold)', opacity: 0.6 }}
                aria-label="Sao ch\u00e9p"
              >
                📋
              </button>
            </span>
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
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [autoPlayTTS, setAutoPlayTTS] = useLocalStorage("historylens-tts-autoplay-" + entityId, true)
  const [ttsSpeed, setTtsSpeed] = useLocalStorage("historylens-tts-speed", 1)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  // Task 2: Sync perspective when entityId or query param changes
  useEffect(() => {
    const paramPerspective = searchParams.get('perspective')
    const validKeys = perspectiveEntries.map(([key]) => key)
    if (paramPerspective && validKeys.includes(paramPerspective)) {
      setPerspective(paramPerspective)
    } else if (validKeys.length > 0 && !validKeys.includes(perspective)) {
      setPerspective(validKeys[0])
    }
  }, [entityId, searchParams, perspectiveEntries])

  const messagesEndRef = useRef(null)
  const mainRef = useRef(null)
  const lastSpokenIndexRef = useRef(-1)

  const { messages, loading, error, sendMessage, changePerspective, followUpSuggestions } = useChat(entityId, perspective)
  const { playUrl, speakLocal, stop, playing: ttsPlaying, loading: ttsLoading, chunkInfo, setSpeed } = useTTS()
  useEffect(() => { setSpeed(ttsSpeed) }, [ttsSpeed, setSpeed])
  const suggestions = useMemo(() => getQuickSuggestions(entity, perspective), [entity, perspective])

  const playPresetAudio = useCallback(async (message) => {
    if (!message?.content) return

    if (message.audioSrc) {
      const played = await playUrl(message.audioSrc)
      if (played) return
    }

    await speakLocal(message.content)
  }, [playUrl, speakLocal])

  useEffect(() => {
    if (autoPlayTTS && !loading) {
      const lastMsgIndex = messages.length - 1
      const lastMsg = messages[lastMsgIndex]
      if (hasPresetAudio(lastMsg) && lastSpokenIndexRef.current !== lastMsgIndex) {
        lastSpokenIndexRef.current = lastMsgIndex
        playPresetAudio(lastMsg).catch(() => {})
      }
    }
  }, [messages, loading, autoPlayTTS, playPresetAudio])

  useEffect(() => {
    stop()
  }, [perspective, stop])

  useEffect(() => {
    if (isPinnedToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, isPinnedToBottom])

  useEffect(() => {
    changePerspective()
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

  const handleClearChat = () => { changePerspective(); lastSpokenIndexRef.current = -1; toastSuccess('Đã xóa cuộc trò chuyện') }

  const handlePlayAudio = (message) => {
    if (ttsPlaying || ttsLoading) {
      stop()
      return
    }
    if (hasPresetAudio(message)) playPresetAudio(message).catch(() => {})
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
            <div className="flex items-center gap-1">
              {TTS_SPEEDS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setTtsSpeed(s.value)}
                  className="px-2 py-1 text-xs rounded-sm"
                  style={{
                    fontFamily: "var(--font-sans)",
                    background: ttsSpeed === s.value ? "rgba(45,106,79,0.15)" : "transparent",
                    border: "1px solid " + (ttsSpeed === s.value ? "rgba(45,106,79,0.4)" : "rgba(184,134,11,0.2)"),
                    color: ttsSpeed === s.value ? "var(--clr-jade)" : "var(--clr-ink-soft)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

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
              {autoPlayTTS ? 'Tự đọc mẫu' : 'Tắt đọc mẫu'}
            </button>

            {messages.length > 0 && (
              <button type="button" onClick={handleClearChat} className="px-3 py-1.5 text-sm rounded-sm" style={{ background: 'transparent', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--clr-vermillion)' }}>Xóa chat</button>
            )}
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


        </div>

        <div className="chat-layout flex-1 overflow-hidden px-2 md:px-0">
          <aside className="hidden md:flex flex-col items-center justify-end pb-0 px-3 border-r" style={{ borderColor: 'rgba(184,134,11,0.12)', background: 'rgba(245,239,224,0.55)' }}>
            <div className="character-vignette character-stage relative">
              <div className="character-floor" />
              <img
                src={getPerspectiveCharacterUrl(entityId, perspective)}
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
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="ml-2 underline"
                >
                  Thử lại
                </button>
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
                  key={msg.id || `${msg.role}-${index}`}
                  msg={msg}
                  isStreaming={loading && index === messages.length - 1}
                  speakerName={getSpeakerName(entity, perspective)}
                  onPlayAudio={handlePlayAudio}
                  ttsActive={ttsPlaying || ttsLoading}
                />
              ))}
            </div>

            {/* Follow-up suggestion buttons */}
            {followUpSuggestions.length > 0 && !loading && messages.length > 0 && (
              <div className="max-w-3xl mx-auto mt-4 animate-in">
                <p className="text-xs mb-2 font-medium" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
                  Tiếp tục khám phá:
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map((item) => {
                    const text = typeof item === 'string' ? item : item.text
                    const isPreset = typeof item === 'object' && item.isPreset
                    return (
                      <button
                        key={text}
                        type="button"
                        onClick={() => handleSuggestionClick(text)}
                        className="followup-chip px-3 py-2 text-sm rounded-sm text-left"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          background: isPreset ? 'rgba(45,106,79,0.08)' : 'rgba(245,239,224,0.85)',
                          border: `1px solid ${isPreset ? 'rgba(45,106,79,0.3)' : 'rgba(184,134,11,0.25)'}`,
                          color: 'var(--clr-ink-soft)',
                        }}
                      >
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span>{isPreset ? '🔊' : '✨'} {text}</span>
                          {isPreset && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-sm"
                              style={{
                                background: 'rgba(45,106,79,0.12)',
                                color: 'var(--clr-jade)',
                                fontSize: '0.65rem',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Có giọng đọc mẫu
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

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
