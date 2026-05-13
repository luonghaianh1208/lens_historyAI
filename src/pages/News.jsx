import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchNewsByCategory, getCategories, formatTimeAgo } from '../services/newsService'
import AnimatedBackground from '../components/AnimatedBackground'

export default function News() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const categories = getCategories()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchNewsByCategory(activeCategory)
      .then(items => { if (!cancelled) setArticles(items) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [activeCategory])

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
          <Link to="/news" className="active">Đọc báo</Link>
          <Link to="/forum">Diễn đàn</Link>
        </nav>
      </header>

      <main className="news-page">
        <div className="news-hero">
          <span className="section-kicker">✦ Cập nhật thông tin</span>
          <h1 className="display news-title">Đọc báo & Tin tức</h1>
          <p className="news-subtitle">
            Tiếp cận nguồn thông tin chính thống, cập nhật kiến thức lịch sử, văn hóa, xã hội
          </p>
        </div>

        {/* Category Tabs */}
        <div className="news-tabs">
          <button
            className={`news-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            📰 Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`news-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="news-loading">
            <div className="news-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="news-skeleton-card card-ancient" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="news-error card-ancient">
            <p>⚠ Không thể tải tin tức: {error}</p>
            <button className="btn-seal" onClick={() => setActiveCategory(activeCategory)}>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="news-empty card-ancient">
            <p>Chưa có tin tức nào cho mục này.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="news-grid">
            {articles.map((article, idx) => (
              <a
                key={`${article.link}-${idx}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card card-ancient"
              >
                {article.thumbnail && (
                  <div className="news-card-img">
                    <img
                      src={article.thumbnail}
                      alt=""
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  </div>
                )}
                <div className="news-card-body">
                  <h3 className="news-card-title">{article.title}</h3>
                  {article.description && (
                    <p className="news-card-desc">{article.description}</p>
                  )}
                  <div className="news-card-meta">
                    <span className="news-card-source">{article.sourceName}</span>
                    <span className="news-card-time">{formatTimeAgo(article.pubDate)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
