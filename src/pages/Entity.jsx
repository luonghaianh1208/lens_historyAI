import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'

export default function Entity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const entity = getEntity(id)
  const [activeTab, setActiveTab] = useState('overview')

  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy</h2>
          <Link to="/" className="text-blue-600 hover:underline">Quay lại trang chủ</Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'sources', label: 'Nguồn' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{entity.name}</h1>
            <p className="text-sm text-gray-500">{entity.period || `${entity.period_start}–${entity.period_end}`}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-gray-700 text-lg leading-relaxed">{entity.short_desc}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {entity.tags?.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Roles */}
            {entity.roles && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Vai trò</h3>
                <div className="flex flex-wrap gap-2">
                  {entity.roles.map((role) => (
                    <span key={role} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chat CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Bắt đầu trò chuyện</h3>
              <p className="text-blue-100 text-sm mb-4">Chọn góc nhìn để trò chuyện với {entity.name}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(entity.perspectives || {}).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => navigate(`/chat/${entity.id}?perspective=${key}`)}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                  >
                    {config.persona || key}
                  </button>
                ))}
              </div>
            </div>

            {/* Related */}
            {entity.related_people?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Nhân vật liên quan</h3>
                <div className="space-y-2">
                  {entity.related_people.map((personId) => (
                    <Link
                      key={personId}
                      to={`/entity/${personId}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                    >
                      👤 {personId.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-6">
                {entity.timeline?.map((item, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className="absolute left-2.5 w-3 h-3 bg-blue-600 rounded-full ring-4 ring-white" />
                    <div>
                      <div className="font-semibold text-gray-900">{item.year}</div>
                      <div className="text-gray-600">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Nguồn tài liệu</h3>
            <div className="space-y-4">
              {entity.chunks?.map((chunk) => (
                <div key={chunk.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-500 mb-2">Nguồn: {chunk.source}</div>
                  <p className="text-gray-700">{chunk.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Độ tin cậy: {chunk.reliability}%
                    </span>
                    {chunk.tags?.map((tag) => (
                      <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}