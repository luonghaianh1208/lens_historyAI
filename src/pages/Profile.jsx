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

  const [activeTab, setActiveTab] = useState('info') // info, paths, flashcards
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
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
    setAvatarUrl(userProfile?.avatar || user.photoURL || '')

    // Load Learning Paths
    const paths = getAllLearningPaths()
    const pathProgress = paths.map(path => {
      const saved = localStorage.getItem(`learning-path-progress-${path.id}`)
      const progress = saved ? JSON.parse(saved) : null
      let completedLevelsCount = progress?.completedLevels?.length || 0
      let totalLevels = path.levels.length
      let percentage = totalLevels > 0 ? Math.round((completedLevelsCount / totalLevels) * 100) : 0
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
        await updateProfile(auth.currentUser, { displayName, photoURL: avatarUrl })
      }
      if (userProfile?.uid) {
        const userRef = doc(db, 'users', userProfile.uid)
        await updateDoc(userRef, { displayName, avatar: avatarUrl })
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

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto">
      <div className="card-ancient p-6 md:p-8">
        <h1 className="display text-3xl mb-8 text-center" style={{color: 'var(--clr-ink)'}}>Hồ sơ cá nhân</h1>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            className={`btn-sm ${activeTab === 'info' ? 'btn-seal' : 'btn-seal-ghost'}`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin
          </button>
          <button 
            className={`btn-sm ${activeTab === 'paths' ? 'btn-seal' : 'btn-seal-ghost'}`}
            onClick={() => setActiveTab('paths')}
          >
            Lộ trình học
          </button>
          <button 
            className={`btn-sm ${activeTab === 'flashcards' ? 'btn-seal' : 'btn-seal-ghost'}`}
            onClick={() => setActiveTab('flashcards')}
          >
            Thẻ ghi nhớ
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'info' && (
            <form onSubmit={handleSaveProfile} className="max-w-md mx-auto space-y-5 animate-fade-in">
              <div className="flex justify-center mb-6">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-28 h-28 rounded-full border-4 border-[var(--clr-seal)] object-cover shadow-lg" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-[var(--clr-paper-alt)] border-4 border-[var(--clr-seal)] flex items-center justify-center text-4xl font-serif text-[var(--clr-ink)] shadow-lg">
                    {(displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="block text-sm mb-2 font-bold" style={{color: 'var(--clr-ink)'}}>Tên hiển thị</label>
                <input 
                  type="text" 
                  className="search-input w-full"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm mb-2 font-bold" style={{color: 'var(--clr-ink)'}}>Ảnh đại diện (URL)</label>
                <input 
                  type="text" 
                  className="search-input w-full"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                />
              </div>
              <div className="pt-6">
                <button type="submit" className="btn-seal w-full py-3 text-lg" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
                {saveSuccess && <p className="text-green-600 text-center mt-3 font-bold animate-fade-in">Lưu thông tin thành công!</p>}
              </div>
            </form>
          )}

          {activeTab === 'paths' && (
            <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
              {learningPaths.length > 0 ? learningPaths.map(path => (
                <div key={path.id} className="p-5 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-paper-alt)] flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm hover:shadow transition-shadow">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg mb-1" style={{color: 'var(--clr-ink)'}}>{path.icon} {path.title}</h3>
                    <p className="text-sm opacity-80" style={{color: 'var(--clr-ink-soft)'}}>{path.description}</p>
                  </div>
                  <div className="text-center sm:text-right w-full sm:min-w-[150px]">
                    <div className="w-full bg-[var(--clr-paper)] border border-[var(--clr-border)] rounded-full h-3 mb-2 overflow-hidden">
                      <div className="bg-[var(--clr-seal)] h-3 rounded-full transition-all duration-1000" style={{ width: `${path.percentage}%` }}></div>
                    </div>
                    <span className="text-xs font-bold block" style={{color: 'var(--clr-ink)'}}>{path.percentage}% hoàn thành</span>
                    <p className="text-xs mt-1" style={{color: 'var(--clr-ink-soft)'}}>Đạt: {path.score} điểm</p>
                  </div>
                </div>
              )) : (
                <p className="text-center italic opacity-70 p-8 border border-dashed border-[var(--clr-border)] rounded-lg">Bạn chưa có dữ liệu lộ trình học nào.</p>
              )}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <div className="flex gap-4 mb-8 justify-center">
                <div className="p-5 border border-[var(--clr-border)] rounded-lg text-center min-w-[120px] bg-[var(--clr-paper-alt)] shadow-sm">
                  <p className="text-sm opacity-80 mb-1" style={{color: 'var(--clr-ink)'}}>Chuỗi ngày</p>
                  <p className="text-3xl font-bold" style={{color: 'var(--clr-seal)'}}>{flashcardStats.streak} 🔥</p>
                </div>
                <div className="p-5 border border-[var(--clr-border)] rounded-lg text-center min-w-[120px] bg-[var(--clr-paper-alt)] shadow-sm">
                  <p className="text-sm opacity-80 mb-1" style={{color: 'var(--clr-ink)'}}>Điểm thưởng</p>
                  <p className="text-3xl font-bold" style={{color: 'var(--clr-seal)'}}>{flashcardStats.points} ⭐</p>
                </div>
              </div>
              <h3 className="font-bold text-xl mb-4 text-center border-b border-[var(--clr-border)] pb-2" style={{color: 'var(--clr-ink)'}}>Các bộ thẻ đã học</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {flashcardStats.cards.length > 0 ? flashcardStats.cards.map(card => (
                  <div key={card.id} className="p-4 border border-[var(--clr-border)] rounded-lg bg-[var(--clr-paper-alt)] flex flex-col justify-between shadow-sm hover:-translate-y-1 transition-transform">
                    <div className="mb-3">
                      <p className="font-bold text-lg line-clamp-1" style={{color: 'var(--clr-ink)'}}>{card.name}</p>
                      <p className="text-xs opacity-70" style={{color: 'var(--clr-ink-soft)'}}>Tiến độ: {card.masteredCount}/{card.totalCards || (card.masteredCount + card.learningCount + card.newCount)} thẻ</p>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-[var(--clr-border)] pt-2 mt-auto">
                      <span className="text-green-700 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {card.masteredCount} Thuộc</span>
                      <span className="text-amber-600 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {card.learningCount} Đang học</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center italic opacity-70 col-span-2 p-8 border border-dashed border-[var(--clr-border)] rounded-lg">Bạn chưa học bộ thẻ ghi nhớ nào.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
