import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'
import { useAuth } from '../hooks/useAuth'

const sampleQuestions = [
  {
    question: "Nguyễn Trãi sinh năm bao nhiêu?",
    options: ["1380", "1428", "1442", "1407"],
    correct: 0,
    explanation: "Nguyễn Trãi sinh năm 1380 tại làng Nhị Khê, Thường Tín. [1]"
  },
  {
    question: "Ai là tác giả của Bình Ngô Đại Cáo?",
    options: ["Lê Lợi", "Trần Hưng Đạo", "Nguyễn Trãi", "Lê Thái Tổ"],
    correct: 2,
    explanation: "Bình Ngô Đại Cáo được Nguyễn Trãi soạn năm 1428 theo lệnh Lê Lợi. [3]"
  },
  {
    question: "Khởi nghĩa Lam Sơn diễn ra trong giai đoạn nào?",
    options: ["1225-1300", "1288", "1418-1427", "1407-1427"],
    correct: 2,
    explanation: "Khởi nghĩa Lam Sơn diễn ra từ 1418 đến 1427, do Lê Lợi lãnh đạo. [ls-001]"
  },
  {
    question: "Trận Bạch Đằng diễn ra năm nào?",
    options: ["1285", "1288", "1426", "1427"],
    correct: 1,
    explanation: "Trận Bạch Đằng diễn ra năm 1288, Trần Hưng Đạo tiêu diệt hạm đội Nguyên. [bd-001]"
  },
  {
    question: "Nguyễn Trãi qua đời năm nào?",
    options: ["1380", "1428", "1442", "1433"],
    correct: 2,
    explanation: "Nguyễn Trãi bị hãm oan vụ Lệ Chi Viên năm 1442 và bị tru di tam tộc. [nt-004]"
  }
]

export default function Quiz() {
  const { entityId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const entity = getEntity(entityId)

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading questions
    setTimeout(() => {
      setQuestions(sampleQuestions)
      setLoading(false)
    }, 1000)
  }, [entityId])

  const handleSelect = (index) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (selectedAnswer === questions[currentQuestion].correct) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(`/entity/${entityId}`)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Quiz: {entity.name}</h1>
            <p className="text-sm text-gray-500">
              {showResult
                ? `Kết quả: ${score}/${questions.length}`
                : `Câu ${currentQuestion + 1}/${questions.length}`
              }
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : showResult ? (
          <div className="space-y-6">
            {/* Score Card */}
            <div className={`bg-white rounded-2xl shadow-sm p-8 text-center ${
              score >= questions.length * 0.8 ? 'border-2 border-green-500' :
              score >= questions.length * 0.5 ? 'border-2 border-yellow-500' :
              'border-2 border-red-500'
            }`}>
              <div className="text-6xl mb-4">
                {score >= questions.length * 0.8 ? '🎉' : score >= questions.length * 0.5 ? '👍' : '📚'}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {score}/{questions.length}
              </div>
              <div className="text-gray-600">
                {score >= questions.length * 0.8
                  ? 'Xuất sắc! Bạn nắm vững kiến thức!'
                  : score >= questions.length * 0.5
                  ? 'Khá tốt! Cần ôn tập thêm.'
                  : 'Cần học thêm về ' + entity.name}
              </div>
            </div>

            {/* Review Answers */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Đáp án</h3>
              <div className="space-y-4">
                {answers.map((answer, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-medium text-gray-900 mb-2">Câu {i + 1}: {questions[i].question}</div>
                    <div className={`text-sm ${answer === questions[i].correct ? 'text-green-600' : 'text-red-600'}`}>
                      ✓ Đáp án đúng: {questions[i].options[questions[i].correct]}
                      {answer !== questions[i].correct && ` (Bạn chọn: ${questions[i].options[answer]})`}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 italic">{questions[i].explanation}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Làm lại
              </button>
              <button
                onClick={() => navigate(`/chat/${entityId}`)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                Chat thêm
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Câu {currentQuestion + 1}/{questions.length}</span>
                <span>Điểm: {score}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQuestion]?.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full p-4 rounded-xl text-left transition ${
                    selectedAnswer === i
                      ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentQuestion < questions.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}