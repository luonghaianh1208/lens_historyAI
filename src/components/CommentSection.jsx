import { useState, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { getComments, addComment, deleteComment } from '../services/forumService'
import { formatTimeAgo } from '../services/newsService'

export default function CommentSection({ postId, onOpenAuth }) {
  const { user, userProfile, isAdmin } = useAuthContext()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getComments(postId)
      setComments(data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    setSubmitting(true)
    try {
      await addComment(postId, {
        content: text.trim(),
        author: {
          uid: user.uid,
          displayName: userProfile?.displayName || user.displayName || 'Ẩn danh',
          avatar: userProfile?.avatar || user.photoURL || ''
        }
      })
      setText('')
      await loadComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Xóa bình luận này?')) return
    try {
      await deleteComment(postId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title display">💬 Bình luận ({comments.length})</h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Viết bình luận..."
            rows={3}
            required
          />
          <button type="submit" className="btn-seal btn-sm" disabled={submitting || !text.trim()}>
            {submitting ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt card-ancient">
          <p>Đăng nhập để bình luận</p>
          <button className="btn-seal btn-sm" onClick={onOpenAuth}>Đăng nhập</button>
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className="comment-loading">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <p className="comment-empty">Chưa có bình luận. Hãy là người đầu tiên!</p>
      ) : (
        <div className="comment-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-author">
                {c.authorAvatar ? (
                  <img src={c.authorAvatar} alt="" className="comment-avatar" />
                ) : (
                  <span className="comment-avatar comment-avatar-initial">
                    {(c.authorName || 'U').charAt(0)}
                  </span>
                )}
                <div>
                  <strong>{c.authorName}</strong>
                  <span className="comment-time">
                    {c.createdAt?.toDate ? formatTimeAgo(c.createdAt.toDate()) : ''}
                  </span>
                </div>
              </div>
              <p className="comment-content">{c.content}</p>
              {(isAdmin || c.authorId === user?.uid) && (
                <button
                  className="comment-delete"
                  onClick={() => handleDelete(c.id)}
                  title="Xóa bình luận"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
