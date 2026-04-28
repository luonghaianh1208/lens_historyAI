import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function Teacher() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [className, setClassName] = useState('')
  const [classes, setClasses] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)

  const handleCreateClass = (e) => {
    e.preventDefault()
    if (!className.trim()) return
    const newClass = {
      id: Date.now().toString(),
      name: className,
      joinCode: generateJoinCode(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      students: []
    }
    setClasses([...classes, newClass])
    setClassName('')
  }

  const handleJoinClass = (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    // In real app, would verify code and add student
    alert(`Đang tham gia lớp với mã: ${joinCode}`)
    setShowJoinModal(false)
    setJoinCode('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Giáo viên</h1>
            <p className="text-sm text-gray-500">Quản lý lớp học</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!user ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập để tiếp tục</h2>
            <p className="text-gray-600 mb-6">Đăng nhập để tạo lớp học và giao bài tập cho học sinh</p>
            <button
              onClick={login}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              Đăng nhập với Google
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Create Class */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tạo lớp mới</h2>
              <form onSubmit={handleCreateClass} className="flex gap-4">
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Tên lớp (VD: Lịch sử 10A)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Tạo lớp
                </button>
              </form>
            </div>

            {/* Join Class */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tham gia lớp</h2>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                Nhập mã lớp
              </button>
            </div>

            {/* My Classes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lớp của tôi</h2>
              {classes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📚</div>
                  <p>Chưa có lớp nào. Tạo lớp đầu tiên!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{cls.name}</h3>
                          <p className="text-sm text-gray-500">Tạo ngày: {cls.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">Mã tham gia</div>
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 font-mono font-bold rounded">
                            {cls.joinCode}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhập mã lớp</h3>
              <form onSubmit={handleJoinClass}>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Mã 6 ký tự"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    Tham gia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}