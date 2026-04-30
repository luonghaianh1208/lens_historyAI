import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'
import { getCharacterUrl, getBgStyle } from '../services/assetService'

function buildFallbackQuestions(entity) {
  const timeline = entity.timeline || []
  const chunks = entity.chunks || []
  const firstTimeline = timeline[0]
  const secondTimeline = timeline[1]
  const source = chunks[0]

  const baseQuestions = [
    {
      question: `${entity.name} gắn với giai đoạn nào?`,
      options: [entity.period || 'Không rõ', 'Thế kỷ XI', 'Thế kỷ XIII', 'Thế kỷ XX'],
      correct: 0,
      explanation: `${entity.name} thuộc giai đoạn ${entity.period || 'được mô tả trong hồ sơ này'}.`,
    },
    {
      question: `Mô tả nào đúng nhất về ${entity.name}?`,
      options: [
        entity.short_desc,
        'Một nhân vật giả tưởng không có trong lịch sử Việt Nam',
        'Một triều đại phong kiến',
        'Một tác phẩm văn học hiện đại',
      ],
      correct: 0,
      explanation: entity.short_desc,
    },
  ]

  if (firstTimeline) {
    baseQuestions.push({
      question: `Mốc nào xuất hiện trong hồ sơ của ${entity.name}?`,
      options: [firstTimeline.year, '9999', '1911', '2000'],
      correct: 0,
      explanation: `${firstTimeline.year} gắn với mốc: ${firstTimeline.event}`,
    })
  }

  if (secondTimeline) {
    baseQuestions.push({
      question: `Sự kiện nào sau đây thuộc niên biểu của ${entity.name}?`,
      options: [secondTimeline.event, 'Không có dữ liệu', 'Một sự kiện hư cấu', 'Một lễ hội đương đại'],
      correct: 0,
      explanation: `${secondTimeline.year}: ${secondTimeline.event}`,
    })
  }

  if (source) {
    baseQuestions.push({
      question: `Nguồn tư liệu nào được dùng trong hồ sơ của ${entity.name}?`,
      options: [source.source, 'Báo giải trí', 'Truyền thuyết vô danh', 'Không có nguồn nào'],
      correct: 0,
      explanation: `Hồ sơ hiện dùng nguồn: ${source.source}.`,
    })
  }

  return baseQuestions.slice(0, 5)
}

function buildQuizPrompt(entity) {
  const info = entity.chunks?.map((chunk) => chunk.content).join('\n') || entity.short_desc || ''

  return `Dựa trên thông tin lịch sử về ${entity.name}, hãy tạo 5 câu hỏi trắc nghiệm bằng tiếng Việt.

THÔNG TIN:
Tên: ${entity.name}
Thời kỳ: ${entity.period || ''}
Mô tả: ${entity.short_desc || ''}
${info}

YÊU CẦU:
- Mỗi câu hỏi có 4 đáp án
- Chỉ có 1 đáp án đúng (index 0-3)
- Câu hỏi kiểm tra sự hiểu biết về sự kiện hoặc chi tiết lịch sử
- Trả lời CHỈ JSON array, không có text khác:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`
}

function getQuizCacheKey(entityId) {
  return `historylens-quiz-${entityId}`
}

function sanitizeQuizQuestions(rawQuestions) {
  if (!Array.isArray(rawQuestions)) return []

  return rawQuestions
    .map((item, index) => {
      const question = typeof item?.question === 'string' ? item.question.trim() : ''
      const options = Array.isArray(item?.options)
        ? item.options
            .filter((option) => typeof option === 'string' || typeof option === 'number')
            .map((option) => String(option).trim())
            .filter(Boolean)
            .slice(0, 4)
        : []
      const explanation = typeof item?.explanation === 'string' ? item.explanation.trim() : ''
      const correct = Number.isInteger(item?.correct) ? item.correct : -1

      if (!question || options.length !== 4 || correct < 0 || correct >= options.length) {
        return null
      }

      return {
        question,
        options,
        correct,
        explanation: explanation || `Đáp án đúng là ${String.fromCharCode(65 + correct)}.`,
        id: item.id || `${index}-${question}`,
      }
    })
    .filter(Boolean)
    .slice(0, 5)
}

export default function Quiz() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const entity = getEntity(entityId)

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [genError, setGenError] = useState(null)
  const [characterMood, setCharacterMood] = useState('neutral')
  const [timeLeft, setTimeLeft] = useState(30)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const completionRate = useMemo(() => (
    questions.length ? Math.round(((currentQuestion + (showResult ? 1 : 0)) / questions.length) * 100) : 0
  ), [currentQuestion, questions.length, showResult])

  useEffect(() => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setCharacterMood('neutral')
    setStreak(0)
    setBestStreak(0)
    setTimeLeft(30)
    setTimerActive(false)
    generateQuestions()
  }, [entityId])

  useEffect(() => {
    if (!timerActive || showResult || loading) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, timerActive, showResult, loading])

  async function generateQuestions(forceRefresh = false) {
    if (!entity) return

    setLoading(true)
    setGenError(null)

    const cacheKey = getQuizCacheKey(entityId)
    if (!forceRefresh) {
      try {
        const cachedValue = sessionStorage.getItem(cacheKey)
        if (cachedValue) {
          const parsed = sanitizeQuizQuestions(JSON.parse(cachedValue))
          if (parsed.length > 0) {
            setQuestions(parsed)
            setLoading(false)
            setTimerActive(true)
            return
          }
        }
      } catch {
        sessionStorage.removeItem(cacheKey)
      }
    }

    try {
      const prompt = buildQuizPrompt(entity)
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'Bạn là chuyên gia lịch sử Việt Nam. Tạo câu hỏi trắc nghiệm chính xác. Trả lời CHỈ JSON array, không markdown, không text thừa.',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 2000,
        }),
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()
      const text = data.text || ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)

      if (jsonMatch) {
        const parsed = sanitizeQuizQuestions(JSON.parse(jsonMatch[0]))
        if (parsed.length > 0) {
          setQuestions(parsed)
          sessionStorage.setItem(cacheKey, JSON.stringify(parsed))
          setLoading(false)
          setTimerActive(true)
          return
        }
      }

      throw new Error('Invalid response format')
    } catch (error) {
      console.error('Quiz generation error:', error)
      setGenError('Không thể tạo quiz từ AI. Đã chuyển sang bộ câu hỏi dự phòng theo đúng hồ sơ hiện tại.')
      setQuestions(sanitizeQuizQuestions(buildFallbackQuestions(entity)))
    } finally {
      setLoading(false)
      setTimerActive(true)
    }
  }

  const handleTimeout = () => {
    setCharacterMood('wrong')
    setStreak(0)
    setTimeout(() => setCharacterMood('neutral'), 1500)
    const nextAnswers = [...answers, -1]
    setAnswers(nextAnswers)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(30)
    } else {
      setShowResult(true)
      setTimerActive(false)
    }
  }

  const handleSelect = (index) => {
    if (!showResult) setSelectedAnswer(index)
  }

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correct
    setCharacterMood(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => setCharacterMood('neutral'), 1500)

    const nextStreak = isCorrect ? streak + 1 : 0
    setStreak(nextStreak)
    if (nextStreak > bestStreak) setBestStreak(nextStreak)

    const nextAnswers = [...answers, selectedAnswer]
    setAnswers(nextAnswers)
    if (isCorrect) setScore((prev) => prev + 1)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(30)
    } else {
      setShowResult(true)
      setTimerActive(false)
    }
  }

  const handleRestart = (forceRefresh = false) => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setCharacterMood('neutral')
    setStreak(0)
    setBestStreak(0)
    setTimeLeft(30)
    setTimerActive(false)
    generateQuestions(forceRefresh)
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
    <div className="page-shell min-h-screen" style={{ background: 'var(--clr-paper)' }}>
      <div className="h-0.5 w-full interactive-surface" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={getBgStyle(entityId)} />

      <div className="interactive-surface">
        <header className="px-4 py-4 flex flex-wrap items-center justify-between gap-4 glass-panel border-b" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(`/entity/${entityId}`)} className="ghost-icon-button p-2 rounded-sm" style={{ color: 'var(--clr-gold)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Quiz: {entity.name}</h1>
              {streak >= 3 && <span className="streak-fire text-xs mr-2" style={{ color: 'var(--clr-vermillion)' }}>🔥 {streak}</span>}
            <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>
                {showResult
                  ? `Kết quả: ${score}/${questions.length}`
                  : loading
                    ? 'Đang tạo câu hỏi...'
                    : `Câu ${currentQuestion + 1}/${questions.length} · Hoàn thành ${completionRate}%`}
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex gap-2">
              <button type="button" onClick={() => handleRestart(false)} className="btn-ghost text-sm">
                Làm lại
              </button>
              <button type="button" onClick={() => handleRestart(true)} className="btn-ghost text-sm">
                Sinh bộ mới
              </button>
            </div>
          )}
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {genError && (
            <div className="mb-4 p-3 text-sm rounded-sm" style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--clr-gold)' }}>
              {genError}
            </div>
          )}

          {loading ? (
            <div className="card-ancient p-8 text-center">
              <div className="animate-pulse">
                <div className="text-4xl mb-4">🤖</div>
                <p className="mb-4" style={{ color: 'var(--clr-ink-soft)' }}>AI đang tạo câu hỏi về {entity.name}...</p>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }} />
                  ))}
                </div>
              </div>
            </div>
          ) : showResult ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
                <img
                  src={getCharacterUrl(entityId)}
                  alt=""
                  className="h-36 object-contain justify-self-center"
                  style={{
                    filter: score >= questions.length * 0.8 ? 'drop-shadow(0 0 12px rgba(45,106,79,0.6))' : 'drop-shadow(0 4px 8px rgba(26,15,10,0.3))',
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div className="card-ancient dong-son-border p-6 text-center">
                  <div className="text-5xl mb-3">
                    {score >= questions.length * 0.8 ? '🎉' : score >= questions.length * 0.5 ? '👍' : '📚'}
                  </div>
                  <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-ink)' }}>
                    {score}/{questions.length}
                  </div>
                  <div className="mt-2" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                    {score >= questions.length * 0.8
                      ? 'Bạn đã nắm khá chắc các ý chính.'
                      : score >= questions.length * 0.5
                        ? 'Bạn đã nhớ được phần cốt lõi, nhưng còn vài điểm nên ôn lại.'
                        : `Bạn nên xem lại hồ sơ và trò chuyện thêm về ${entity.name}.`}
                  </div>
                </div>
              </div>

              <div className="card-ancient p-6">
                <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Ôn lại từng câu</h3>
                <div className="space-y-4">
                  {answers.map((answer, index) => (
                    <div key={index} className="p-4" style={{ background: 'rgba(232,220,200,0.4)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                      <div className="font-medium mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                        Câu {index + 1}: {questions[index].question}
                      </div>
                      <div className="space-y-1 mb-2">
                        {questions[index].options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="px-3 py-2 text-sm"
                            style={{
                              background: optionIndex === questions[index].correct
                                ? 'rgba(45,106,79,0.15)'
                                : optionIndex === answer && answer !== questions[index].correct
                                  ? 'rgba(192,57,43,0.15)'
                                  : 'rgba(245,239,224,0.5)',
                              color: optionIndex === questions[index].correct
                                ? 'var(--clr-jade)'
                                : optionIndex === answer && answer !== questions[index].correct
                                  ? 'var(--clr-vermillion)'
                                  : 'var(--clr-ink-soft)',
                              borderRadius: '2px',
                              border: `1px solid ${optionIndex === questions[index].correct ? 'rgba(45,106,79,0.3)' : optionIndex === answer ? 'rgba(192,57,43,0.3)' : 'transparent'}`,
                            }}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                            {optionIndex === questions[index].correct && ' ✓'}
                            {optionIndex === answer && answer !== questions[index].correct && ' ✕'}
                          </div>
                        ))}
                      </div>
                      <div className="text-sm mt-2 italic" style={{ color: 'var(--clr-gold)' }}>{questions[index].explanation}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button type="button" onClick={() => handleRestart(false)} className="btn-primary">Làm lại</button>
                <button type="button" onClick={() => navigate(`/chat/${entityId}`)} className="btn-ghost">Chat thêm</button>
              </div>
            </div>
          ) : (
            <div className="card-ancient p-6">
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--clr-ink-soft)' }}>
                  <span>Câu {currentQuestion + 1}/{questions.length}</span>
                  <span>Điểm: {score}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(184,134,11,0.15)' }}>
                  <div className="h-full transition-all" style={{ width: `${completionRate}%`, background: 'var(--clr-gold)' }} />
                </div>
              </div>

              <div className="grid md:grid-cols-[auto_1fr] gap-6 mb-6">
                <div className="relative flex-shrink-0 justify-self-center">
                  <img
                    src={getCharacterUrl(entityId)}
                    alt=""
                    className="h-32 object-contain transition-all duration-500"
                    style={{
                      filter: characterMood === 'correct'
                        ? 'drop-shadow(0 0 12px rgba(45,106,79,0.6))'
                        : characterMood === 'wrong'
                          ? 'drop-shadow(0 0 12px rgba(192,57,43,0.6))'
                          : 'drop-shadow(0 8px 16px rgba(26,15,10,0.3))',
                      transform: characterMood === 'correct' ? 'translateY(-8px)' : characterMood === 'wrong' ? 'rotate(-3deg)' : 'none',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  {characterMood === 'correct' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">✨</div>
                  )}
                  {characterMood === 'wrong' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-pulse">💭</div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="section-kicker mb-3">Câu hỏi hiện tại</p>
                  <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                    {questions[currentQuestion]?.question}
                  </h2>

                  <div className="space-y-2">
                    {questions[currentQuestion]?.options.map((option, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(index)}
                        className="quiz-option-button w-full text-left px-4 py-3 text-sm rounded-sm"
                        style={{
                          background: selectedAnswer === index ? 'rgba(192,57,43,0.1)' : 'rgba(245,239,224,0.9)',
                          border: `1px solid ${selectedAnswer === index ? 'var(--clr-vermillion)' : 'rgba(184,134,11,0.3)'}`,
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--clr-ink)',
                        }}
                      >
                        <span style={{ color: 'var(--clr-gold)', marginRight: '10px' }}>{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
                className="btn-primary w-full mt-4"
                style={{ opacity: selectedAnswer === null ? 0.5 : 1, cursor: selectedAnswer === null ? 'not-allowed' : 'pointer' }}
              >
                {currentQuestion < questions.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
              </button>
              <button
                type="button"
                onClick={handleTimeout}
                className="btn-ghost w-full mt-2 text-sm"
              >
                Bỏ qua
              </button>
            </div>
          )}
        </main>

        <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
      </div>
    </div>
  )
}
