import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { getPosts, createPost } from '../services/forumService'
import PostCard from '../components/PostCard'
import PostEditor from '../components/PostEditor'
import AuthModal from '../components/AuthModal'
import AnimatedBackground from '../components/AnimatedBackground'

export default function Forum() {
  const { user, userProfile } = useAuthContext()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await getPosts({ status: 'approved' })
      setPosts(data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async ({ title, content, category, tags, images }) => {
    if (!user || !userProfile) return
    setCreating(true)
    try {
      await createPost({
        title, content, category, tags, images,
        author: {
          uid: user.uid,
          displayName: userProfile.displayName,
          avatar: userProfile.avatar || user.photoURL || ''
        }
      })
      setShowEditor(false)
      alert('✅ Bài viết đã được gửi thành công! Quản trị viên sẽ duyệt bài trong thời gian sớm nhất.')
      await loadPosts()
    } catch (err) {
      alert('❌ Lỗi: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleWriteClick = () => {
    if (!user) {
      setShowAuth(true)
    } else {
      setShowEditor(true)
    }
  }

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.category === filter)

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <header className="site-header">
        <Link to="/" className="site-logo">
          <img src="/assets/logo.webp" alt="" width="32" height="32" />
          <span className="display">HistoryLens</span>
        </Link>
        <nav className="site-nav">
          <Link to="/">Trang chủ</Link>
          <Link to="/learning-paths">Lộ trình học</Link>
          <Link to="/news">Đọc báo</Link>
          <Link to="/forum" className="active">Diễn đàn</Link>
        </nav>
      </header>

      <main className="forum-page">
        <div className="forum-hero">
          <span className="section-kicker">✦ Đàm đạo Sử học</span>
          <h1 className="display forum-title">Diễn đàn Sử học</h1>
          <p className="forum-subtitle">
            Chia sẻ kiến thức, thảo luận và kết nối cùng cộng đồng yêu lịch sử
          </p>
        </div>

        {/* Actions Bar */}
        <div className="forum-actions">
          <div className="forum-filters">
            {['all', 'discussion', 'article', 'question'].map(cat => (
              <button
                key={cat}
                className={`forum-filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? '📰 Tất cả' : cat === 'discussion' ? '💬 Thảo luận' : cat === 'article' ? '📝 Bài viết' : '❓ Câu hỏi'}
              </button>
            ))}
          </div>
          <button className="btn-seal" onClick={handleWriteClick}>
            ✍ Viết bài
          </button>
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="forum-editor-overlay" onClick={() => setShowEditor(false)}>
            <div className="forum-editor-wrap" onClick={e => e.stopPropagation()}>
              <PostEditor
                onSubmit={handleCreate}
                onCancel={() => setShowEditor(false)}
                loading={creating}
              />
            </div>
          </div>
        )}

        {/* Post List */}
        {loading ? (
          <div className="forum-loading">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="post-skeleton card-ancient" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="forum-empty card-ancient">
            <p>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
            <button className="btn-seal" onClick={handleWriteClick}>
              ✍ Viết bài đầu tiên
            </button>
          </div>
        ) : (
          <div className="forum-grid">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={(id) => navigate(`/forum/${id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
