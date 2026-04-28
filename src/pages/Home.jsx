import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchEntities } from '../services/retrieval'

const suggestions = [
  { id: 'nguyen-trai', name: 'Nguyễn Trãi', type: 'person' },
  { id: 'tran-hung-dao', name: 'Trần Hưng Đạo', type: 'person' },
  { id: 'khoi-nghia-lam-son', name: 'Khởi nghĩa Lam Sơn', type: 'event' },
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (value) => {
    setQuery(value)
    if (value.trim()) {
      const found = searchEntities(value)
      setResults(found)
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }

  const handleSelect = (id) => {
    setShowResults(false)
    setQuery('')
    navigate(`/entity/${id}`)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-xl font-bold text-gray-800">HistoryLens AI</h1>
          </div>
          <Link
            to="/teacher"
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition"
          >
            👨‍🏫 Giáo viên
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Nhập vai nhân vật lịch sử Việt Nam
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Trò chuyện với AI dưới góc nhìn của Nguyễn Trãi, Trần Hưng Đạo, Lê Lợi...
        </p>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm nhân vật hoặc sự kiện..."
              className="w-full px-6 py-4 text-lg border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Search Results */}
          {showResults && results.length > 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
              {results.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => handleSelect(entity.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <span className="text-xl">{entity.type === 'person' ? '👤' : '📜'}</span>
                  <div>
                    <div className="font-medium text-gray-900">{entity.name}</div>
                    <div className="text-sm text-gray-500">{entity.type === 'person' ? 'Nhân vật' : 'Sự kiện'} · {entity.period}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && query && results.length === 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-gray-500">
              Không tìm thấy kết quả
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 text-sm transition"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid md:grid-cols-2 gap-6 justify-center max-w-2xl mx-auto">
          <Link
            to="/entity/nguyen-trai"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">💬</div>
            <h3 className="font-semibold text-gray-900 mb-2">Chat với nhân vật</h3>
            <p className="text-sm text-gray-600">Trò chuyện dưới 3 góc nhìn: nhập vai, người cùng thời, sử gia</p>
          </Link>
          <Link
            to="/quiz/nguyen-trai"
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="text-3xl mb-4">📝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Luyện Quiz</h3>
            <p className="text-sm text-gray-600">Kiểm tra kiến thức với câu hỏi trắc nghiệm sinh tự động</p>
          </Link>
        </div>
      </main>
    </div>
  )
}