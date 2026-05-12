import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyticsData, exportAnalytics, clearAnalytics } from '../services/analytics'
import { getAllEntities, getEntityStatus, isEntityVerified } from '../services/retrieval'

const ADMIN_PASSWORD = 'historylens2025' // In production, use environment variable

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    if (authenticated) {
      setAnalytics(getAnalyticsData())
    }
  }, [authenticated])

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
    } else {
      alert('Mật khẩu không đúng')
    }
  }

  const handleExport = () => {
    exportAnalytics()
  }

  const handleClearAnalytics = () => {
    if (confirm('Xóa tất cả dữ liệu analytics? Hành động này không thể hoàn tác.')) {
      clearAnalytics()
      setAnalytics(getAnalyticsData())
    }
  }

  if (!authenticated) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center">
        <div className="card-ancient p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🔐</span>
            <h1 className="display text-xl font-bold" style={{ color: 'var(--clr-ink)' }}>
              Khu vực Quản trị
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
              Yêu cầu xác thực để truy cập
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--clr-ink)' }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2"
                style={{
                  background: 'rgba(245,239,224,0.8)',
                  border: '1px solid rgba(184,134,11,0.4)',
                  borderRadius: '2px',
                  color: 'var(--clr-ink)',
                }}
                placeholder="Nhập mật khẩu quản trị"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2"
            >
              Đăng nhập
            </button>
          </form>

          <p className="mt-4 text-xs text-center" style={{ color: 'var(--clr-ink-soft)' }}>
            Chỉ dành cho team phát triển
          </p>
        </div>
      </div>
    )
  }

  const entities = getAllEntities()
  const verifiedCount = entities.filter(isEntityVerified).length
  const pendingCount = entities.filter(e => !isEntityVerified(e)).length

  // Calculate analytics summary
  const summary = useMemo(() => {
    if (!analytics) return null

    const events = analytics.events
    const entityViews = events.filter(e => e.event === 'entity_view')
    const quizCompletes = events.filter(e => e.event === 'quiz_complete')
    const chatMessages = events.filter(e => e.event === 'chat_message')
    const flashcardReviews = events.filter(e => e.event === 'flashcard_review')

    // Top viewed entities
    const entityCounts = {}
    entityViews.forEach(e => {
      if (e.entityId) {
        entityCounts[e.entityId] = (entityCounts[e.entityId] || 0) + 1
      }
    })
    const topEntities = Object.entries(entityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => {
        const entity = entities.find(e => e.id === id)
        return { id, name: entity?.name || id, count }
      })

    // Quiz score average
    const avgQuizScore = quizCompletes.length > 0
      ? Math.round(quizCompletes.reduce((sum, e) => sum + (e.score || 0), 0) / quizCompletes.length)
      : 0

    return {
      totalEvents: events.length,
      entityViews: entityViews.length,
      quizCompletes: quizCompletes.length,
      chatMessages: chatMessages.length,
      flashcardReviews: flashcardReviews.length,
      avgQuizScore,
      topEntities,
      uniqueSessions: new Set(events.map(e => e.sessionId)).size,
      uniqueUsers: new Set(events.map(e => e.userId)).size,
    }
  }, [analytics, entities])

  return (
    <div className="page-container min-h-screen">
      <div className="interactive-surface">
        <header className="border-b glass-panel">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--clr-gold)' }}>
                ← Quay trang chủ
              </Link>
              <span style={{ color: 'var(--clr-gold)' }}>|</span>
              <span className="font-semibold" style={{ color: 'var(--clr-ink)' }}>
                🔧 Quản trị
              </span>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-sm"
              style={{ color: 'var(--clr-vermillion)' }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'entities', label: 'Quản lý nội dung' },
              { key: 'analytics', label: 'Analytics' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-sm font-semibold transition"
                style={{
                  color: activeTab === tab.key ? 'var(--clr-vermillion)' : 'var(--clr-ink-soft)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--clr-vermillion)' : '2px solid transparent',
                  marginBottom: '-2px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-ancient p-4">
                  <p className="text-xs mb-1" style={{ color: 'var(--clr-ink-soft)' }}>Tổng entities</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--clr-ink)' }}>{entities.length}</p>
                </div>
                <div className="card-ancient p-4">
                  <p className="text-xs mb-1" style={{ color: 'var(--clr-ink-soft)' }}>Đã verify</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--clr-jade)' }}>{verifiedCount}</p>
                </div>
                <div className="card-ancient p-4">
                  <p className="text-xs mb-1" style={{ color: 'var(--clr-ink-soft)' }}>Chờ review</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--clr-vermillion)' }}>{pendingCount}</p>
                </div>
                <div className="card-ancient p-4">
                  <p className="text-xs mb-1" style={{ color: 'var(--clr-ink-soft)' }}>Tỷ lệ verify</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--clr-gold)' }}>
                    {Math.round((verifiedCount / entities.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-ancient p-5">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>📊 Quick Stats</h3>
                  {summary && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--clr-ink-soft)' }}>Page views:</span>
                        <span className="font-semibold" style={{ color: 'var(--clr-ink)' }}>{summary.entityViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--clr-ink-soft)' }}>Quiz completed:</span>
                        <span className="font-semibold" style={{ color: 'var(--clr-ink)' }}>{summary.quizCompletes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--clr-ink-soft)' }}>Chat messages:</span>
                        <span className="font-semibold" style={{ color: 'var(--clr-ink)' }}>{summary.chatMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--clr-ink-soft)' }}>Flashcard reviews:</span>
                        <span className="font-semibold" style={{ color: 'var(--clr-ink)' }}>{summary.flashcardReviews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--clr-ink-soft)' }}>Avg quiz score:</span>
                        <span className="font-semibold" style={{ color: 'var(--clr-jade)' }}>{summary.avgQuizScore}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-ancient p-5">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>⚡ Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 text-left text-sm"
                      style={{ background: 'rgba(184,134,11,0.1)', borderRadius: '2px' }}
                    >
                      📥 Export analytics data
                    </button>
                    <button
                      onClick={handleClearAnalytics}
                      className="w-full px-4 py-2 text-left text-sm"
                      style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '2px', color: 'var(--clr-vermillion)' }}
                    >
                      🗑️ Clear analytics data
                    </button>
                    <button
                      onClick={() => window.open('/sitemap.xml', '_blank')}
                      className="w-full px-4 py-2 text-left text-sm"
                      style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '2px' }}
                    >
                      📄 View sitemap.xml
                    </button>
                    <button
                      onClick={() => alert('Feature coming soon: Batch entity generation')}
                      className="w-full px-4 py-2 text-left text-sm"
                      style={{ background: 'rgba(34,197,94,0.1)', borderRadius: '2px' }}
                    >
                      🤖 Generate entity content (batch)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entities Tab */}
          {activeTab === 'entities' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--clr-ink-soft)' }}>
                  Quản lý nội dung entities và trạng thái verification
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--clr-jade)' }}>
                    ✓ Verified: {verifiedCount}
                  </span>
                  <span className="px-2 py-1 text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--clr-vermillion)' }}>
                    ⏳ Pending: {pendingCount}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {entities.map(entity => {
                  const status = getEntityStatus(entity.id)
                  const verified = isEntityVerified(entity.id)

                  return (
                    <div
                      key={entity.id}
                      className="flex items-center justify-between p-3 rounded-sm"
                      style={{ background: 'rgba(245,239,224,0.5)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span>{entity.type === 'person' ? '👤' : '⚔️'}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--clr-ink)' }}>
                            {entity.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>
                            {entity.period} • {entity.chunks?.length || 0} chunks
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-1 text-xs rounded"
                          style={{
                            background: verified ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                            color: verified ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {verified ? '✓ Verified' : '⏳ Pending'}
                        </span>
                        <Link
                          to={`/entity/${entity.id}`}
                          className="px-3 py-1 text-xs"
                          style={{
                            background: 'rgba(184,134,11,0.15)',
                            color: 'var(--clr-ink-soft)',
                            borderRadius: '2px',
                          }}
                        >
                          Xem
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && summary && (
            <div className="space-y-6">
              <div className="card-ancient p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>📈 Tổng quan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3" style={{ background: 'rgba(184,134,11,0.08)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--clr-ink)' }}>{summary.totalEvents}</p>
                    <p className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>Tổng events</p>
                  </div>
                  <div className="text-center p-3" style={{ background: 'rgba(184,134,11,0.08)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--clr-ink)' }}>{summary.uniqueUsers}</p>
                    <p className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>Unique users</p>
                  </div>
                  <div className="text-center p-3" style={{ background: 'rgba(184,134,11,0.08)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--clr-ink)' }}>{summary.uniqueSessions}</p>
                    <p className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>Sessions</p>
                  </div>
                  <div className="text-center p-3" style={{ background: 'rgba(34,197,94,0.08)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--clr-jade)' }}>{summary.avgQuizScore}%</p>
                    <p className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>Avg quiz score</p>
                  </div>
                </div>

                <h4 className="font-semibold mb-3" style={{ color: 'var(--clr-ink)' }}>Top 5 Entities được xem nhiều</h4>
                <div className="space-y-2">
                  {summary.topEntities.map((entity, idx) => (
                    <div key={entity.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--clr-gold)' }}>#{idx + 1}</span>
                      <span className="text-sm flex-1" style={{ color: 'var(--clr-ink)' }}>{entity.name}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--clr-jade)' }}>{entity.count} views</span>
                    </div>
                  ))}
                  {summary.topEntities.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--clr-ink-soft)' }}>Chưa có data</p>
                  )}
                </div>
              </div>

              <div className="card-ancient p-5">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>📋 Event Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Entity Views', value: summary.entityViews, color: 'var(--clr-jade)' },
                    { label: 'Quiz Completes', value: summary.quizCompletes, color: 'var(--clr-gold)' },
                    { label: 'Chat Messages', value: summary.chatMessages, color: 'var(--clr-vermillion)' },
                    { label: 'Flashcard Reviews', value: summary.flashcardReviews, color: 'var(--clr-ink)' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm w-32" style={{ color: 'var(--clr-ink-soft)' }}>{item.label}</span>
                      <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'rgba(184,134,11,0.1)' }}>
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${summary.totalEvents > 0 ? (item.value / summary.totalEvents) * 100 : 0}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right" style={{ color: 'var(--clr-ink)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
