import { formatTimeAgo } from '../services/newsService'

const categoryLabels = {
  discussion: 'Thảo luận',
  article: 'Bài viết',
  question: 'Câu hỏi'
}

export default function PostCard({ post, onClick }) {
  const statusBadge = post.status === 'pending'
    ? <span className="post-badge post-badge-pending">Chờ duyệt</span>
    : null

  return (
    <article className="post-card card-ancient" onClick={() => onClick?.(post.id)}>
      {post.images?.length > 0 && (
        <div className="post-card-img">
          <img src={post.images[0]} alt="" loading="lazy" />
        </div>
      )}
      <div className="post-card-body">
        <div className="post-card-header">
          <span className="post-card-category">
            {categoryLabels[post.category] || post.category}
          </span>
          {statusBadge}
        </div>
        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-preview">
          {(post.content || '').slice(0, 150)}
          {post.content?.length > 150 ? '...' : ''}
        </p>
        {post.tags?.length > 0 && (
          <div className="post-card-tags">
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="post-tag">#{tag}</span>
            ))}
          </div>
        )}
        <div className="post-card-footer">
          <div className="post-card-author">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt="" className="post-author-avatar" />
            ) : (
              <span className="post-author-avatar post-author-initial">
                {(post.authorName || 'U').charAt(0)}
              </span>
            )}
            <span>{post.authorName}</span>
          </div>
          <div className="post-card-stats">
            <span title="Thích">♥ {post.likes || 0}</span>
            <span title="Bình luận">💬 {post.commentCount || 0}</span>
            <span className="post-card-time">
              {post.createdAt?.toDate ? formatTimeAgo(post.createdAt.toDate()) : ''}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
