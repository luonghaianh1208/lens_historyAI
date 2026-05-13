import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyticsData, exportAnalytics, clearAnalytics } from '../services/analytics'
import { getAllEntities, getEntityStatus, isEntityVerified } from '../services/retrieval'
import { useAuthContext } from '../contexts/AuthContext'
import { getPendingPosts, updatePostStatus, deletePost, getAllUsers, banUser } from '../services/forumService'

export default function AdminDashboard() {
  const { user, userProfile, isAdmin, loading: authLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [pendingPosts, setPendingPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      setAnalytics(getAnalyticsData())
      loadPendingPosts()
      loadUsers()
    }
  }, [isAdmin])

  const loadPendingPosts = async () => {
    setLoadingPosts(true)
    try {
      const posts = await getPendingPosts()
      setPendingPosts(posts)
    } catch (err) {
      console.error('Failed to load pending posts:', err)
    } finally {
      setLoadingPosts(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleApprovePost = async (postId) => {
    await updatePostStatus(postId, 'approved')
    setPendingPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleRejectPost = async (postId) => {
    await updatePostStatus(postId, 'rejected')
    setPendingPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Xác nhận xóa bài viết này?')) return
    await deletePost(postId)
    setPendingPosts(prev => prev.filter(p => p.id !== postId))
  }

  const handleBanUser = async (uid, currentBanned) => {
    const action = currentBanned ? 'gỡ chặn' : 'chặn'
    if (!confirm(`Xác nhận ${action} người dùng này?`)) return
    await banUser(uid, !currentBanned)
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !currentBanned } : u))
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

  if (authLoading) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center">
        <div className="card-ancient p-8"><p>Đang tải...</p></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center">
        <div className="card-ancient p-8 max-w-md w-full text-center">
          <span className="text-4xl mb-2 block">🔐</span>
          <h1 className="display text-xl font-bold" style={{ color: 'var(--clr-ink)' }}>
            Khu vực Quản trị
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--clr-ink-soft)' }}>
            {user ? 'Bạn không có quyền truy cập trang này.' : 'Đăng nhập với tài khoản Admin để truy cập.'}
          </p>
          <Link to="/" className="btn-seal mt-4 inline-block">← Trang chủ</Link>
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
            <span className="text-sm" style={{ color: 'var(--clr-ink-soft)' }}>
              👤 {userProfile?.displayName || user?.email}
            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'posts', label: `Duyệt bài (${pendingPosts.length})` },
              { key: 'users', label: 'Người dùng' },
              { key: 'entities', label: 'Entities' },
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

          {/* Posts Moderation Tab */}
          {activeTab === 'posts' && (
            <div>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>📝 Bài viết chờ duyệt</h2>
              {loadingPosts ? (
                <p style={{ color: 'var(--clr-ink-soft)' }}>Đang tải...</p>
              ) : pendingPosts.length === 0 ? (
                <div className="card-ancient p-6 text-center">
                  <p style={{ color: 'var(--clr-ink-soft)' }}>✅ Không có bài viết nào chờ duyệt</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPosts.map(post => (
                    <div key={post.id} className="card-ancient p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold" style={{ color: 'var(--clr-ink)' }}>{post.title}</h3>
                          <p className="text-sm mt-1" style={{ color: 'var(--clr-ink-soft)' }}>
                            Bởi <strong>{post.authorName}</strong>
                            {post.createdAt?.toDate ? ` • ${post.createdAt.toDate().toLocaleDateString('vi-VN')}` : ''}
                          </p>
                          <p className="text-sm mt-2" style={{ color: 'var(--clr-ink)' }}>
                            {(post.content || '').slice(0, 300)}...
                          </p>
                          {post.images?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {post.images.slice(0, 3).map((url, i) => (
                                <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded" />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="btn-seal btn-sm" onClick={() => handleApprovePost(post.id)}>✓ Duyệt</button>
                          <button className="btn-seal-ghost btn-sm" onClick={() => handleRejectPost(post.id)}>✗ Từ chối</button>
                          <button className="btn-seal-ghost btn-sm" style={{ color: 'var(--clr-vermillion)' }} onClick={() => handleDeletePost(post.id)}>🗑 Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--clr-ink)' }}>👥 Quản lý người dùng ({users.length})</h2>
              {loadingUsers ? (
                <p style={{ color: 'var(--clr-ink-soft)' }}>Đang tải...</p>
              ) : users.length === 0 ? (
                <div className="card-ancient p-6 text-center">
                  <p style={{ color: 'var(--clr-ink-soft)' }}>Chưa có người dùng nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.uid} className="flex items-center justify-between p-3 rounded-sm" style={{ background: 'rgba(245,239,224,0.5)' }}>
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--clr-gold)', color: 'white' }}>
                            {(u.displayName || 'U').charAt(0)}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--clr-ink)' }}>
                            {u.displayName || 'Ẩn danh'}
                            {u.role === 'admin' && <span className="ml-2 px-1 text-xs" style={{ background: 'var(--clr-gold)', color: 'white' }}>Admin</span>}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--clr-ink-soft)' }}>
                          📝 {u.postCount || 0} • 💬 {u.commentCount || 0}
                        </span>
                        {u.role !== 'admin' && (
                          <button
                            className="btn-seal-ghost btn-sm"
                            style={{ color: u.isBanned ? 'var(--clr-jade)' : 'var(--clr-vermillion)' }}
                            onClick={() => handleBanUser(u.uid, u.isBanned)}
                          >
                            {u.isBanned ? '🔓 Gỡ chặn' : '🚫 Chặn'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
