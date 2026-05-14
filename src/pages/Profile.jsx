import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { getAllLearningPaths } from '../data/learning-paths'
import manifest from '../data/manifest.json'

export default function Profile() {
  const { user, userProfile } = useAuthContext()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('info')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Progress Data
  const [learningPaths, setLearningPaths] = useState([])
  const [flashcardStats, setFlashcardStats] = useState({ streak: 0, points: 0, cards: [] })

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }

    setDisplayName(userProfile?.displayName || user.displayName || '')

    // Load Learning Paths
    const paths = getAllLearningPaths()
    const pathProgress = paths.map(path => {
      const saved = localStorage.getItem(`learning-path-progress-${path.id}`)
      const progress = saved ? JSON.parse(saved) : null
      const completedLevelsCount = progress?.completedLevels?.length || 0
      const totalLevels = path.levels.length
      const percentage = totalLevels > 0 ? Math.round((completedLevelsCount / totalLevels) * 100) : 0
      return { ...path, completedLevelsCount, totalLevels, percentage, score: progress?.totalScore || 0 }
    })
    setLearningPaths(pathProgress)

    // Load Flashcards
    const streak = parseInt(localStorage.getItem('flashcards-streak') || '0', 10)
    const points = parseInt(localStorage.getItem('gamification-points') || '0', 10)

    const cards = manifest.entities.map(entity => {
      const saved = localStorage.getItem(`flashcards-state-${entity.id}`)
      if (!saved) return null
      const state = JSON.parse(saved)
      return {
        ...entity,
        masteredCount: state.masteredCards?.length || 0,
        learningCount: state.learningCards?.length || 0,
        newCount: state.newCards?.length || 0,
        totalCards: entity.chunksCount || 0
      }
    }).filter(Boolean)

    setFlashcardStats({ streak, points, cards })
  }, [user, userProfile, navigate])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName })
      }
      if (userProfile?.uid) {
        const userRef = doc(db, 'users', userProfile.uid)
        await updateDoc(userRef, { displayName })
      }
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error("Error updating profile", err)
      alert("Đã xảy ra lỗi khi cập nhật hồ sơ")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const avatarSrc = userProfile?.avatar || user.photoURL
  const initial = (displayName || user.email || 'U').charAt(0).toUpperCase()

  // Summary stats
  const totalPathsStarted = learningPaths.filter(p => p.percentage > 0).length
  const totalFlashcardDecks = flashcardStats.cards.length
  const totalMastered = flashcardStats.cards.reduce((sum, c) => sum + c.masteredCount, 0)

  return (
    <div className="profile-page" style={{ minHeight: '100vh', background: 'var(--clr-paper)' }}>

      {/* ── Hero Banner ── */}
      <div className="profile-hero">
        <div className="profile-hero-overlay" />
        <div className="profile-hero-content">
          <button
            className="profile-back-btn"
            onClick={() => navigate(-1)}
            title="Quay lại"
          >
            ← Quay lại
          </button>

          <div className="profile-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={displayName} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initial">{initial}</div>
            )}
          </div>

          <h1 className="profile-hero-name">{displayName || user.email?.split('@')[0]}</h1>
          <p className="profile-hero-email">{user.email}</p>

          <div className="profile-stats-row">
            <div className="profile-stat">
              <span className="profile-stat-value">{totalPathsStarted}</span>
              <span className="profile-stat-label">Lộ trình đã học</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{totalFlashcardDecks}</span>
              <span className="profile-stat-label">Bộ thẻ đã ôn</span>
            </div>
            <div className="profile-stat-divider" />
            <div className="profile-stat">
              <span className="profile-stat-value">{totalMastered}</span>
              <span className="profile-stat-label">Thẻ đã thuộc</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="profile-body">
        <nav className="profile-tabs">
          {[
            { key: 'info', label: '📝 Thông tin', icon: '' },
            { key: 'paths', label: '🗺️ Lộ trình học', icon: '' },
            { key: 'flashcards', label: '🃏 Thẻ ghi nhớ', icon: '' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Tab Content ── */}
        <div className="profile-tab-content animate-fade-in" key={activeTab}>

          {/* ─── Info Tab ─── */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="profile-info-form">
              <h2 className="profile-section-title">Chỉnh sửa thông tin</h2>

              <div className="profile-field">
                <label className="profile-label">Email</label>
                <input
                  type="text"
                  className="profile-input"
                  value={user.email || ''}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Tên hiển thị</label>
                <input
                  type="text"
                  className="profile-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div className="profile-field">
                <label className="profile-label">Vai trò</label>
                <input
                  type="text"
                  className="profile-input"
                  value={userProfile?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? '⏳ Đang lưu...' : '💾 Lưu thông tin'}
              </button>
              {saveSuccess && (
                <p className="profile-save-success animate-fade-in">✅ Đã lưu thành công!</p>
              )}
            </form>
          )}

          {/* ─── Learning Paths Tab ─── */}
          {activeTab === 'paths' && (
            <div className="profile-paths">
              <h2 className="profile-section-title">Tiến trình lộ trình học</h2>
              {learningPaths.length > 0 ? (
                <div className="profile-paths-grid">
                  {learningPaths.map(path => (
                    <div key={path.id} className="profile-path-card">
                      <div className="profile-path-icon">{path.icon}</div>
                      <div className="profile-path-info">
                        <h3 className="profile-path-title">{path.title}</h3>
                        <p className="profile-path-desc">{path.description}</p>
                        <div className="profile-path-bar-wrap">
                          <div className="profile-path-bar">
                            <div
                              className="profile-path-bar-fill"
                              style={{ width: `${path.percentage}%` }}
                            />
                          </div>
                          <span className="profile-path-pct">{path.percentage}%</span>
                        </div>
                        <div className="profile-path-meta">
                          <span>📊 {path.completedLevelsCount}/{path.totalLevels} cấp</span>
                          <span>⭐ {path.score} điểm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-empty">
                  <p>📭 Bạn chưa bắt đầu lộ trình học nào.</p>
                  <button className="btn-seal btn-sm" onClick={() => navigate('/learning-paths')}>
                    Khám phá lộ trình →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── Flashcards Tab ─── */}
          {activeTab === 'flashcards' && (
            <div className="profile-flashcards">
              <h2 className="profile-section-title">Thống kê thẻ ghi nhớ</h2>

              <div className="profile-fc-overview">
                <div className="profile-fc-stat fire">
                  <span className="profile-fc-stat-icon">🔥</span>
                  <span className="profile-fc-stat-val">{flashcardStats.streak}</span>
                  <span className="profile-fc-stat-label">Chuỗi ngày</span>
                </div>
                <div className="profile-fc-stat star">
                  <span className="profile-fc-stat-icon">⭐</span>
                  <span className="profile-fc-stat-val">{flashcardStats.points}</span>
                  <span className="profile-fc-stat-label">Điểm thưởng</span>
                </div>
                <div className="profile-fc-stat mastered">
                  <span className="profile-fc-stat-icon">✅</span>
                  <span className="profile-fc-stat-val">{totalMastered}</span>
                  <span className="profile-fc-stat-label">Đã thuộc</span>
                </div>
              </div>

              {flashcardStats.cards.length > 0 ? (
                <>
                  <h3 className="profile-sub-title">Các bộ thẻ đã học</h3>
                  <div className="profile-fc-grid">
                    {flashcardStats.cards.map(card => {
                      const total = card.totalCards || (card.masteredCount + card.learningCount + card.newCount)
                      const pct = total > 0 ? Math.round((card.masteredCount / total) * 100) : 0
                      return (
                        <div key={card.id} className="profile-fc-card">
                          <div className="profile-fc-card-header">
                            <p className="profile-fc-card-name">{card.name}</p>
                            <span className="profile-fc-card-pct">{pct}%</span>
                          </div>
                          <div className="profile-path-bar-wrap" style={{ marginBottom: '8px' }}>
                            <div className="profile-path-bar">
                              <div
                                className="profile-path-bar-fill"
                                style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--clr-jade)' : 'var(--clr-gold)' }}
                              />
                            </div>
                          </div>
                          <div className="profile-fc-card-stats">
                            <span className="fc-stat-green">✓ {card.masteredCount} Thuộc</span>
                            <span className="fc-stat-amber">◎ {card.learningCount} Đang học</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="profile-empty">
                  <p>📭 Bạn chưa ôn tập bộ thẻ nào.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
