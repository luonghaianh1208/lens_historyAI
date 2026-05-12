import { useState, useEffect, useCallback } from 'react'
import { getEntity } from '../services/retrieval'

/**
 * Spaced Repetition Flashcard Component
 * Supports SM-2 algorithm for scheduling reviews
 */

const STORAGE_KEY = 'flashcards-state'

export default function Flashcard({ entityId, onClose }) {
  const [cardState, setCardState] = useState({
    front: '',
    back: '',
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    nextReview: Date.now(),
  })
  const [isFlipped, setIsFlipped] = useState(false)
  const [quality, setQuality] = useState(null) // 0-5 rating for answer
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const entity = getEntity(entityId)
    if (entity) {
      // Generate flashcard content from entity
      const front = `${entity.name} (${entity.period})`
      const back = `${entity.short_desc}\n\n` +
        `📅 Niên đại: ${entity.dates || 'Không rõ'}\n` +
        `🏷️ Tags: ${entity.tags?.join(', ') || 'Không có'}\n\n` +
        `📚 Tóm tắt:\n${entity.description?.substring(0, 300)}...`

      // Load saved state if exists
      const savedState = localStorage.getItem(`${STORAGE_KEY}-${entityId}`)
      const now = Date.now()

      if (savedState) {
        const parsed = JSON.parse(savedState)
        // If review is due, use saved state; otherwise reset
        if (parsed.nextReview <= now) {
          setCardState(parsed)
        } else {
          setCardState({
            ...parsed,
            front,
            back,
          })
        }
      } else {
        setCardState(prev => ({
          ...prev,
          front,
          back,
        }))
      }
    }
  }, [entityId])

  const saveState = useCallback((state) => {
    localStorage.setItem(`${STORAGE_KEY}-${entityId}`, JSON.stringify(state))
  }, [entityId])

  // SM-2 Algorithm
  const calculateNextReview = (currentState, quality) => {
    const { repetitions, interval, easeFactor } = currentState

    // Quality: 0 (worst) to 5 (perfect)
    if (quality >= 3) {
      const newRepetitions = repetitions + 1
      let newInterval
      if (newRepetitions === 1) {
        newInterval = 1
      } else if (newRepetitions === 2) {
        newInterval = 6
      } else {
        newInterval = Math.round(interval * easeFactor)
      }
      return {
        repetitions: newRepetitions,
        interval: newInterval,
        easeFactor: easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
        nextReview: Date.now() + newInterval * 24 * 60 * 60 * 1000, // days to ms
      }
    } else {
      // Reset
      return {
        repetitions: 0,
        interval: 1,
        easeFactor: easeFactor,
        nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000,
      }
    }
  }

  const handleAnswer = (selectedQuality) => {
    const newState = calculateNextReview(cardState, selectedQuality)
    const updatedState = { ...cardState, ...newState }
    setCardState(updatedState)
    saveState(updatedState)
    setQuality(selectedQuality)
    setShowAnswer(false)
    setIsFlipped(false)

    // Award gamification points
    const points = selectedQuality >= 3 ? 10 : 5
    const currentPoints = parseInt(localStorage.getItem('gamification-points') || '0')
    localStorage.setItem('gamification-points', (currentPoints + points).toString())

    // Streak tracking
    const today = new Date().toDateString()
    const lastStudyDate = localStorage.getItem('flashcards-last-study')
    const streak = parseInt(localStorage.getItem('flashcards-streak') || '0')

    if (lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      if (lastStudyDate === yesterday) {
        localStorage.setItem('flashcards-streak', (streak + 1).toString())
      } else {
        localStorage.setItem('flashcards-streak', '1')
      }
      localStorage.setItem('flashcards-last-study', today)
    }

    setTimeout(() => {
      setQuality(null)
    }, 1000)
  }

  const formatNextReview = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = date - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days <= 0) return 'Sẵn sàng ôn tập'
    if (days === 1) return 'Ôn lại ngày mai'
    return `Ôn lại sau ${days} ngày`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="card-ancient max-w-lg w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
              📚 Flashcard ôn tập
            </p>
            <h2 className="display text-xl font-bold" style={{ color: 'var(--clr-ink)' }}>
              {cardState.front || 'Đang tải...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition"
            style={{ color: 'var(--clr-ink-soft)' }}
          >
            ×
          </button>
        </div>

        {/* Card */}
        <div
          className="relative h-64 mb-6 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="absolute inset-0 transition-transform duration-500 preserve-3d"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 backface-hidden rounded-sm p-6 flex items-center justify-center text-center"
              style={{
                background: 'rgba(245,239,224,0.95)',
                border: '1px solid rgba(184,134,11,0.3)',
                backfaceVisibility: 'hidden',
              }}
            >
              <p className="display text-2xl md:text-3xl font-bold" style={{ color: 'var(--clr-ink)' }}>
                {cardState.front}
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 backface-hidden rounded-sm p-6 overflow-y-auto"
              style={{
                background: 'rgba(255,255,255,0.98)',
                border: '2px solid var(--clr-gold)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--clr-ink)', fontFamily: 'var(--font-serif)' }}>
                {cardState.back}
              </div>
            </div>
          </div>
        </div>

        {/* Quality buttons */}
        {showAnswer && (
          <div className="grid grid-cols-6 gap-2 mb-4">
            {[0, 1, 2, 3, 4, 5].map(q => (
              <button
                key={q}
                onClick={() => handleAnswer(q)}
                className={`py-2 px-3 rounded-sm text-sm font-semibold transition ${
                  q <= 2
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : q === 3
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                {q === 0 ? '😔' : q === 1 ? '😕' : q === 2 ? '😐' : q === 3 ? '🙂' : q === 4 ? '😊' : '🤩'}
                <br />
                <span className="text-xs">{q}</span>
              </button>
            ))}
          </div>
        )}

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full btn-primary py-3 text-lg"
          >
            Hiển thị đáp án
          </button>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span style={{ color: 'var(--clr-ink-soft)' }}>
            Lần lặp: {cardState.repetitions} • Ease: {cardState.easeFactor.toFixed(2)}
          </span>
          <span style={{ color: 'var(--clr-gold)' }}>
            {formatNextReview(cardState.nextReview)}
          </span>
        </div>
      </div>
    </div>
  )
}
