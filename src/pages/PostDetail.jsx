import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { getPost, toggleLikePost, deletePost } from '../services/forumService'
import { formatTimeAgo } from '../services/newsService'
import CommentSection from '../components/CommentSection'
import AuthModal from '../components/AuthModal'
import AnimatedBackground from '../components/AnimatedBackground'

export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuthContext()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [lightboxImg, setLightboxImg] = useState(null)

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    setLoading(true)
    try {
      const data = await getPost(postId)
      setPost(data)
    } catch (err) {
      console.error('Failed to load post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) { setShowAuth(true); return }
    const liked = await toggleLikePost(postId, user.uid)
    setPost(prev => ({
      ...prev,
      likes: prev.likes + (liked ? 1 : -1),
      likedBy: liked
        ? [...(prev.likedBy || []), user.uid]
        : (prev.likedBy || []).filter(id => id !== user.uid)
    }))
  }

  const handleDelete = async () => {
    if (!confirm('Xác nhận xóa bài viết này?')) return
    await deletePost(postId)
    navigate('/forum')
  }

  if (loading) {
    return (
      <div className="page-shell">
        <AnimatedBackground />
        <div className="post-detail-loading card-ancient">Đang tải bài viết...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page-shell">
        <AnimatedBackground />
        <div className="post-detail-empty card-ancient">
          <p>Bài viết không tồn tại hoặc chưa được duyệt.</p>
          <Link to="/forum" className="btn-seal">← Về diễn đàn</Link>
        </div>
      </div>
    )
  }

  const isLiked = user && (post.likedBy || []).includes(user.uid)
  const isAuthor = user && post.authorId === user.uid

  return (
    <div className="page-shell">
      <AnimatedBackground />

      <header className="site-header">
        <Link to="/" className="site-logo">
          <img src="/assets/logo.webp" alt="" width="32" height="32" />
          <span className="display">HistoryLens</span>
        </Link>
        <nav className="site-nav">
          <Link to="/forum">← Diễn đàn</Link>
        </nav>
      </header>

      <main className="post-detail">
        <article className="post-detail-article card-ancient">
          {/* Header */}
          <div className="post-detail-header">
            <div className="post-detail-meta">
              <div className="post-detail-author">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="" className="post-author-avatar-lg" />
                ) : (
                  <span className="post-author-avatar-lg post-author-initial">
                    {(post.authorName || 'U').charAt(0)}
                  </span>
                )}
                <div>
                  <strong>{post.authorName}</strong>
                  <span className="post-detail-time">
                    {post.createdAt?.toDate ? formatTimeAgo(post.createdAt.toDate()) : ''}
                  </span>
                </div>
              </div>
              {(isAdmin || isAuthor) && (
                <button className="btn-seal-ghost btn-sm post-delete-btn" onClick={handleDelete}>
                  🗑 Xóa bài
                </button>
              )}
            </div>
            <h1 className="display post-detail-title">{post.title}</h1>
            {post.tags?.length > 0 && (
              <div className="post-detail-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="post-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="post-detail-content">
            {post.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Images Gallery — view in-app */}
          {post.images?.length > 0 && (
            <div className="post-detail-gallery">
              {post.images.map((url, i) => (
                <div key={i} className="post-gallery-item" onClick={() => setLightboxImg(url)}>
                  <img src={url} alt={`Hình ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="post-detail-actions">
            <button
              className={`post-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? '♥' : '♡'} {post.likes || 0} Thích
            </button>
          </div>
        </article>

        {/* Comments */}
        <CommentSection postId={postId} onOpenAuth={() => setShowAuth(true)} />
      </main>

      {/* Lightbox — view images in-app */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
            <img src={lightboxImg} alt="Full size" />
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
