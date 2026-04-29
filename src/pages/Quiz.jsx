import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'
import { getCharacterUrl, getBgStyle } from '../services/assetService'

const fallbackQuestions = [
  {
    question: "Nguyễn Trãi sinh năm bao nhiêu?",
    options: ["1380", "1428", "1442", "1407"],
    correct: 0,
    explanation: "Nguyễn Trãi sinh năm 1380 tại làng Nhị Khê, Thường Tín."
  },
  {
    question: "Ai là tác giả của Bình Ngô Đại Cáo?",
    options: ["Lê Lợi", "Trần Hưng Đạo", "Nguyễn Trãi", "Lê Thái Tổ"],
    correct: 2,
    explanation: "Bình Ngô Đại Cáo được Nguyễn Trãi soạn năm 1428 theo lệnh Lê Lợi."
  },
  {
    question: "Khởi nghĩa Lam Sơn diễn ra trong giai đoạn nào?",
    options: ["1225-1300", "1288", "1418-1427", "1407-1427"],
    correct: 2,
    explanation: "Khởi nghĩa Lam Sơn diễn ra từ 1418 đến 1427, do Lê Lợi lãnh đạo."
  },
  {
    question: "Trận Bạch Đằng diễn ra năm nào?",
    options: ["1285", "1288", "1426", "1427"],
    correct: 1,
    explanation: "Trận Bạch Đằng diễn ra năm 1288, Trần Hưng Đạo tiêu diệt hạm đội Nguyên."
  },
  {
    question: "Nguyễn Trãi qua đời năm nào?",
    options: ["1380", "1428", "1442", "1433"],
    correct: 2,
    explanation: "Nguyễn Trãi bị hãm oan vụ Lệ Chi Viên năm 1442 và bị tru di tam tộc."
  }
]

function buildQuizPrompt(entity) {
  const info = entity.chunks?.map(c => c.content).join('\n') || entity.short_desc || ''

  return `Dựa trên thông tin lịch sử về ${entity.name}, hãy tạo 5 câu hỏi trắc nghiệm bằng tiếng Việt.

THÔNG TIN:
Tên: ${entity.name}
Thời kỳ: ${entity.period || ''}
Mô tả: ${entity.short_desc || ''}
${info}

YÊU CẦU:
- Mỗi câu hỏi có 4 đáp án
- Chỉ có 1 đáp án đúng (index 0-3)
- Câu hỏi kiểm tra sự hiểu biết về sự kiện/chi tiết lịch sử
- Trả lời CHỈ JSON array, không có text khác:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`
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

  useEffect(() => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setCharacterMood('neutral')
    generateQuestions()
  }, [entityId])

  async function generateQuestions() {
    setLoading(true)
    setGenError(null)

    try {
      const prompt = buildQuizPrompt(entity)

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: 'Bạn là chuyên gia lịch sử Việt Nam. Tạo câu hỏi trắc nghiệm chính xác. Trả lời CHỈ JSON array, không markdown, không text thừa.',
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 2000
        })
      })

      if (!response.ok) throw new Error('API error')

      const data = await response.json()
      const text = data.text || ''

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed)
          setLoading(false)
          return
        }
      }
      throw new Error('Invalid response format')
    } catch (err) {
      console.error('Quiz generation error:', err)
      setGenError('Không thể tạo quiz từ AI. Dùng câu hỏi mẫu.')
      setQuestions(fallbackQuestions)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (index) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correct
    setCharacterMood(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => setCharacterMood('neutral'), 2000)

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (isCorrect) {
      setScore(score + 1)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setCharacterMood('neutral')
    generateQuestions()
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
    <div className="min-h-screen relative" style={{ background: 'var(--clr-paper)' }}>

      {/* Decorative top band */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

      {/* Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={getBgStyle(entityId)} />

      {/* ===== HEADER ===== */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-4"
        style={{ background: 'rgba(245,239,224,0.95)', borderBottom: '1px solid rgba(184,134,11,0.2)', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => navigate(`/entity/${entityId}`)} className="p-2 transition" style={{ color: 'var(--clr-gold)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--clr-gold)'}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Quiz: {entity.name}</h1>
          <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>
            {showResult
              ? `Kết quả: ${score}/${questions.length}`
              : loading
                ? 'Đang tạo câu hỏi...'
                : `Câu ${currentQuestion + 1}/${questions.length}`
            }
          </p>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">

        {genError && (
          <div className="mb-4 p-3 text-sm" style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-gold)' }}>
            {genError}
          </div>
        )}

        {loading ? (
          <div className="card-ancient p-8 text-center">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🤖</div>
              <p className="mb-4" style={{ color: 'var(--clr-ink-soft)' }}>AI đang tạo câu hỏi về {entity.name}...</p>
              <div className="space-y-3">
                <div className="h-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }}></div>
                <div className="h-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }}></div>
                <div className="h-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }}></div>
                <div className="h-12 rounded" style={{ background: 'rgba(184,134,11,0.1)' }}></div>
              </div>
            </div>
          </div>
        ) : showResult ? (
          <div className="space-y-6">
            {/* Character + Score */}
            <div className="flex items-center justify-center gap-6">
              <img
                src={getCharacterUrl(entityId)}
                alt=""
                className="h-32 object-contain"
                style={{
                  filter: score >= questions.length * 0.8
                    ? 'drop-shadow(0 0 12px rgba(45,106,79,0.6))'
                    : 'drop-shadow(0 4px 8px rgba(26,15,10,0.3))',
                }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="card-ancient dong-son-border p-6 text-center flex-1">
                <div className="text-5xl mb-3">
                  {score >= questions.length * 0.8 ? '🎉' : score >= questions.length * 0.5 ? '👍' : '📚'}
                </div>
                <div className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--clr-ink)' }}>
                  {score}/{questions.length}
                </div>
                <div className="mt-2" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                  {score >= questions.length * 0.8
                    ? 'Xuất sắc! Bạn nắm vững kiến thức!'
                    : score >= questions.length * 0.5
                      ? 'Khá tốt! Cần ôn tập thêm.'
                      : `Cần học thêm về ${entity.name}`}
                </div>
              </div>
            </div>

            {/* Review Answers */}
            <div className="card-ancient p-6">
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Đáp án</h3>
              <div className="space-y-4">
                {answers.map((answer, i) => (
                  <div key={i} className="p-4" style={{ background: 'rgba(232,220,200,0.4)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                    <div className="font-medium mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                      Câu {i + 1}: {questions[i].question}
                    </div>
                    <div className="space-y-1 mb-2">
                      {questions[i].options.map((opt, j) => (
                        <div
                          key={j}
                          className="px-3 py-2 text-sm"
                          style={{
                            background: j === questions[i].correct
                              ? 'rgba(45,106,79,0.15)'
                              : j === answer && answer !== questions[i].correct
                                ? 'rgba(192,57,43,0.15)'
                                : 'rgba(245,239,224,0.5)',
                            color: j === questions[i].correct
                              ? 'var(--clr-jade)'
                              : j === answer && answer !== questions[i].correct
                                ? 'var(--clr-vermillion)'
                                : 'var(--clr-ink-soft)',
                            borderRadius: '2px',
                            border: `1px solid ${j === questions[i].correct ? 'rgba(45,106,79,0.3)' : j === answer ? 'rgba(192,57,43,0.3)' : 'transparent'}`,
                          }}
                        >
                          {String.fromCharCode(65 + j)}. {opt}
                          {j === questions[i].correct && ' ✓'}
                          {j === answer && answer !== questions[i].correct && ' ✗'}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm mt-2 italic" style={{ color: 'var(--clr-gold)' }}>{questions[i].explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button onClick={handleRestart} className="btn-primary">
                Làm lại
              </button>
              <button onClick={() => navigate(`/chat/${entityId}`)} className="btn-ghost">
                Chat thêm
              </button>
            </div>
          </div>
        ) : (
          <div className="card-ancient p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--clr-ink-soft)' }}>
                <span>Câu {currentQuestion + 1}/{questions.length}</span>
                <span>Điểm: {score}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(184,134,11,0.15)' }}>
                <div
                  className="h-full transition-all"
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%`, background: 'var(--clr-gold)' }}
                />
              </div>
            </div>

            {/* Question + Character */}
            <div className="flex gap-4 mb-6">
              {/* Character reaction */}
              <div className="relative flex-shrink-0">
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
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                {characterMood === 'correct' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-bounce">✨</div>
                )}
                {characterMood === 'wrong' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl animate-pulse">💭</div>
                )}
              </div>

              {/* Question */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                  {questions[currentQuestion]?.question}
                </h2>

                {/* Options */}
                <div className="space-y-2">
                  {questions[currentQuestion]?.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className="w-full text-left px-4 py-3 text-sm transition"
                      style={{
                        background: selectedAnswer === i
                          ? 'rgba(192,57,43,0.1)'
                          : 'rgba(245,239,224,0.9)',
                        border: `1px solid ${selectedAnswer === i ? 'var(--clr-vermillion)' : 'rgba(184,134,11,0.3)'}`,
                        borderRadius: '2px',
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--clr-ink)',
                      }}
                      onMouseEnter={e => {
                        if (selectedAnswer !== i) {
                          e.currentTarget.style.background = 'rgba(184,134,11,0.1)'
                          e.currentTarget.style.borderColor = 'var(--clr-gold)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedAnswer !== i) {
                          e.currentTarget.style.background = 'rgba(245,239,224,0.9)'
                          e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)'
                        }
                      }}
                    >
                      <span style={{ color: 'var(--clr-gold)', marginRight: '10px' }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleAnswer}
              disabled={selectedAnswer === null}
              className="btn-primary w-full mt-4"
              style={{ opacity: selectedAnswer === null ? 0.5 : 1, cursor: selectedAnswer === null ? 'not-allowed' : 'pointer' }}
            >
              {currentQuestion < questions.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
            </button>
          </div>
        )}
      </main>

      {/* Bottom band */}
      <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
    </div>
  )
}