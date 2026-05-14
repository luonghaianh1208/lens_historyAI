import { useState, useEffect, useCallback, useMemo } from 'react'
import { getEntity } from '../services/retrieval'
import { trackFlashcardReview } from '../services/analytics'

/**
 * Spaced Repetition Flashcard Component (Multi-card deck)
 * SM-2 algorithm, nhiều thẻ sinh từ entity data
 */

const STORAGE_KEY = 'flashcards-state'

/* ── Helpers ── */

function buildCards(entity) {
  const cards = []

  // Card 1: Tên → Mô tả
  cards.push({
    id: `${entity.id}-desc`,
    front: entity.name,
    back: entity.short_desc || 'Chưa có mô tả.',
    category: 'Giới thiệu',
  })

  // Card 2: Giai đoạn → Nhân vật + vai trò
  if (entity.period) {
    const roles = entity.roles?.length ? entity.roles.join(', ') : ''
    cards.push({
      id: `${entity.id}-period`,
      front: `Giai đoạn "${entity.period}" gắn với nhân vật/sự kiện nào?`,
      back: `${entity.name}${roles ? `\nVai trò: ${roles}` : ''}`,
      category: 'Giai đoạn',
    })
  }

  // Cards từ timeline
  const timeline = entity.timeline || []
  timeline.forEach((item, index) => {
    cards.push({
      id: `${entity.id}-tl-${index}`,
      front: `Năm ${item.year} — điều gì xảy ra liên quan đến ${entity.name}?`,
      back: item.event,
      category: 'Niên biểu',
    })
  })

  // Cards từ chunks (nguồn tư liệu)
  const chunks = entity.chunks || []
  chunks.forEach((chunk, index) => {
    if (!chunk.content || chunk.content.length < 20) return
    // Tạo câu hỏi từ nội dung chunk
    const summary = chunk.content.length > 250
      ? chunk.content.substring(0, 250) + '…'
      : chunk.content
    cards.push({
      id: `${entity.id}-chunk-${index}`,
      front: `Theo nguồn "${chunk.source}", nội dung nào liên quan đến ${entity.name}?`,
      back: summary,
      category: 'Tư liệu',
    })
  })

  // Cards từ perspectives
  const perspectives = Object.entries(entity.perspectives || {})
  perspectives.forEach(([key, value]) => {
    if (!value.persona) return
    cards.push({
      id: `${entity.id}-persp-${key}`,
      front: `Góc nhìn "${value.persona}" khi nói về ${entity.name} là gì?`,
      back: value.system_prompt
        ? value.system_prompt.substring(0, 300) + (value.system_prompt.length > 300 ? '…' : '')
        : `Bạn có thể trò chuyện từ góc nhìn ${value.persona} trong phần Chat.`,
      category: 'Góc nhìn',
    })
  })

  // Cards từ related_people
  if (entity.related_people?.length > 0) {
    cards.push({
      id: `${entity.id}-related`,
      front: `Những nhân vật nào liên quan đến ${entity.name}?`,
      back: entity.related_people.map(id => id.replace(/-/g, ' ')).join(', '),
      category: 'Liên quan',
    })
  }

  // Cards từ tags
  if (entity.tags?.length > 2) {
    cards.push({
      id: `${entity.id}-tags`,
      front: `Các từ khoá chính liên quan đến ${entity.name}?`,
      back: entity.tags.join(' · '),
      category: 'Từ khoá',
    })
  }

  return cards
}

function getDefaultSM2() {
  return {
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  }
}

function calculateNextReview(state, quality) {
  const { repetitions, interval, easeFactor } = state
  if (quality >= 3) {
    const newReps = repetitions + 1
    let newInterval
    if (newReps === 1) newInterval = 1
    else if (newReps === 2) newInterval = 6
    else newInterval = Math.round(interval * easeFactor)
    return {
      repetitions: newReps,
      interval: newInterval,
      easeFactor: Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))),
      nextReview: Date.now() + newInterval * 86400000,
    }
  }
  return {
    repetitions: 0,
    interval: 1,
    easeFactor: Math.max(1.3, easeFactor),
    nextReview: Date.now() + 86400000,
  }
}

/* ── Quality Button Config ── */
const QUALITY_BUTTONS = [
  { label: 'Quên', emoji: '😔', quality: 0, color: 'rgba(192,57,43,0.15)', hoverColor: 'rgba(192,57,43,0.25)', textColor: 'var(--clr-vermillion)' },
  { label: 'Khó', emoji: '😕', quality: 2, color: 'rgba(184,134,11,0.15)', hoverColor: 'rgba(184,134,11,0.25)', textColor: 'var(--clr-gold)' },
  { label: 'Ổn', emoji: '🙂', quality: 4, color: 'rgba(45,106,79,0.12)', hoverColor: 'rgba(45,106,79,0.22)', textColor: 'var(--clr-jade)' },
  { label: 'Dễ', emoji: '🤩', quality: 5, color: 'rgba(45,106,79,0.2)', hoverColor: 'rgba(45,106,79,0.35)', textColor: 'var(--clr-jade)' },
]

/* ── Component ── */

export default function Flashcard({ entityId, onClose }) {
  const entity = useMemo(() => getEntity(entityId), [entityId])
  const cards = useMemo(() => entity ? buildCards(entity) : [], [entity])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [sm2Map, setSm2Map] = useState({}) // cardId → SM-2 state
  const [feedback, setFeedback] = useState(null) // brief feedback toast

  // Load saved SM-2 states
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}-${entityId}`)
      if (saved) setSm2Map(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [entityId])

  const saveStates = useCallback((map) => {
    localStorage.setItem(`${STORAGE_KEY}-${entityId}`, JSON.stringify(map))
  }, [entityId])

  const card = cards[currentIndex] || null
  const cardSM2 = card ? (sm2Map[card.id] || getDefaultSM2()) : getDefaultSM2()

  const goTo = (index) => {
    setCurrentIndex(index)
    setIsFlipped(false)
    setShowQuality(false)
  }

  const goPrev = () => { if (currentIndex > 0) goTo(currentIndex - 1) }
  const goNext = () => { if (currentIndex < cards.length - 1) goTo(currentIndex + 1) }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) setShowQuality(true)
  }

  const handleQuality = (quality) => {
    if (!card) return
    const newState = calculateNextReview(cardSM2, quality)
    const newMap = { ...sm2Map, [card.id]: newState }
    setSm2Map(newMap)
    saveStates(newMap)

    // Analytics + gamification
    trackFlashcardReview(entityId, quality, newState.interval, newState.repetitions)

    // Streak tracking
    const today = new Date().toDateString()
    const lastStudy = localStorage.getItem('flashcards-last-study')
    const streak = parseInt(localStorage.getItem('flashcards-streak') || '0')
    if (lastStudy !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      localStorage.setItem('flashcards-streak', (lastStudy === yesterday ? streak + 1 : 1).toString())
      localStorage.setItem('flashcards-last-study', today)
    }

    // Brief feedback
    setFeedback(quality >= 3 ? '✓ Ghi nhận' : '↻ Sẽ ôn lại sớm')
    setTimeout(() => setFeedback(null), 800)

    // Auto advance
    if (currentIndex < cards.length - 1) {
      setTimeout(() => goTo(currentIndex + 1), 400)
    } else {
      setTimeout(() => {
        setIsFlipped(false)
        setShowQuality(false)
      }, 400)
    }
  }

  const formatNextReview = (ts) => {
    const days = Math.ceil((ts - Date.now()) / 86400000)
    if (days <= 0) return 'Sẵn sàng ôn'
    if (days === 1) return 'Ngày mai'
    return `Sau ${days} ngày`
  }

  // Count cards due for review
  const dueCount = cards.filter(c => {
    const st = sm2Map[c.id]
    return !st || st.nextReview <= Date.now()
  }).length

  if (!entity || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="card-ancient max-w-md w-full p-8 text-center">
          <p className="text-lg mb-4" style={{ color: 'var(--clr-ink)', fontFamily: 'var(--font-serif)' }}>
            Chưa có dữ liệu flashcard cho nhân vật này.
          </p>
          <button onClick={onClose} className="btn-primary">Đóng</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,15,10,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card-ancient max-w-lg w-full p-6 relative" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-xs mb-1" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
              📚 Flashcard · {entity.name}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: 'var(--clr-ink)' }}>
                {currentIndex + 1} / {cards.length}
              </span>
              {card && (
                <span className="text-xs px-2 py-0.5" style={{
                  background: 'rgba(184,134,11,0.12)',
                  color: 'var(--clr-gold)',
                  borderRadius: '2px',
                  fontFamily: 'var(--font-serif)',
                }}>
                  {card.category}
                </span>
              )}
              {dueCount > 0 && (
                <span className="text-xs" style={{ color: 'var(--clr-vermillion)' }}>
                  {dueCount} thẻ cần ôn
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition flex-shrink-0 ml-2"
            style={{ color: 'var(--clr-ink-soft)' }}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-4 flex-shrink-0" style={{ background: 'rgba(184,134,11,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / cards.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--clr-gold), var(--clr-jade))',
            }}
          />
        </div>

        {/* Card area */}
        <div
          className="relative mb-4 cursor-pointer flex-1 min-h-0"
          onClick={handleFlip}
          style={{ perspective: '1200px', minHeight: '220px' }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-sm p-6 flex flex-col items-center justify-center text-center"
              style={{
                background: 'rgba(245,239,224,0.95)',
                border: '1px solid rgba(184,134,11,0.3)',
                backfaceVisibility: 'hidden',
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
                Câu hỏi
              </p>
              <p className="text-lg md:text-xl font-semibold leading-relaxed" style={{ color: 'var(--clr-ink)', fontFamily: 'var(--font-serif)' }}>
                {card?.front}
              </p>
              <p className="text-xs mt-6 opacity-50" style={{ color: 'var(--clr-ink-soft)' }}>
                Nhấp để lật thẻ
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-sm p-6 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.98)',
                border: '2px solid var(--clr-gold)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--clr-jade)', fontFamily: 'var(--font-serif)' }}>
                Đáp án
              </p>
              <div className="whitespace-pre-line text-sm md:text-base leading-relaxed" style={{ color: 'var(--clr-ink)', fontFamily: 'var(--font-serif)' }}>
                {card?.back}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div className="text-center text-sm font-semibold mb-2 animate-pulse" style={{ color: 'var(--clr-jade)' }}>
            {feedback}
          </div>
        )}

        {/* Quality buttons — only after flipping */}
        {showQuality && isFlipped ? (
          <div className="flex-shrink-0">
            <p className="text-xs text-center mb-2" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
              Bạn nhớ thẻ này tốt không?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {QUALITY_BUTTONS.map((btn) => (
                <button
                  key={btn.quality}
                  onClick={(e) => { e.stopPropagation(); handleQuality(btn.quality) }}
                  className="py-3 rounded-sm text-center transition-all hover:scale-105"
                  style={{
                    background: btn.color,
                    border: `1px solid ${btn.hoverColor}`,
                    fontFamily: 'var(--font-serif)',
                  }}
                >
                  <span className="text-xl block mb-1">{btn.emoji}</span>
                  <span className="text-xs font-semibold block" style={{ color: btn.textColor }}>
                    {btn.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : !showQuality ? (
          <button
            onClick={handleFlip}
            className="w-full btn-primary py-3 text-base flex-shrink-0"
          >
            Lật thẻ xem đáp án
          </button>
        ) : null}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            disabled={currentIndex === 0}
            className="btn-ghost text-sm px-4 py-2"
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          >
            ← Trước
          </button>

          <span className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>
            {formatNextReview(cardSM2.nextReview)}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            disabled={currentIndex === cards.length - 1}
            className="btn-ghost text-sm px-4 py-2"
            style={{ opacity: currentIndex === cards.length - 1 ? 0.3 : 1 }}
          >
            Sau →
          </button>
        </div>

        {/* Card dots */}
        {cards.length > 1 && cards.length <= 20 && (
          <div className="flex justify-center gap-1.5 mt-3 flex-shrink-0 flex-wrap">
            {cards.map((c, i) => {
              const reviewed = sm2Map[c.id]?.repetitions > 0
              return (
                <button
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); goTo(i) }}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    background: i === currentIndex
                      ? 'var(--clr-vermillion)'
                      : reviewed
                        ? 'var(--clr-jade)'
                        : 'rgba(184,134,11,0.25)',
                    transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`Thẻ ${i + 1}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
