import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'
import { getBackgroundUrl, getCharacterUrl, getBgStyle } from '../services/assetService'
import AnimatedBackground from '../components/AnimatedBackground'

export default function Entity() {
  const { id } = useParams()
  const navigate = useNavigate()
  const entity = getEntity(id)
  const [activeTab, setActiveTab] = useState('overview')

  if (!entity) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--clr-paper)' }}>
        <div className="text-center card-ancient p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Không tìm thấy</h2>
          <Link to="/" className="hover:underline" style={{ color: 'var(--clr-vermillion)' }}>Quay lại trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--clr-paper)' }}>

      {/* ===== HOẠT ẢNH NỀN ===== */}
      <AnimatedBackground entityId={id} />

      {/* ===== ẢNH NỀN ENTITY (mờ, phía sau) ===== */}
      <div
        className="fixed inset-0 z-0 opacity-15"
        style={{
          ...getBgStyle(id),
          filter: 'blur(2px) saturate(0.7)',
        }}
      />

      {/* ===== GRADIENT OVERLAY ===== */}
      <div className="fixed inset-0 z-0" style={{
        background: 'linear-gradient(135deg, rgba(245,239,224,0.88) 0%, rgba(232,220,200,0.82) 100%)'
      }} />

      {/* ===== DECORATIVE TOP BAND ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1"
        style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

      {/* ===== HEADER ===== */}
      <header className="relative z-20 px-6 pt-5 pb-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 px-3 py-1.5 text-sm transition"
          style={{ background: 'rgba(245,239,224,0.8)', border: '1px solid rgba(184,134,11,0.35)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)', backdropFilter: 'blur(8px)' }}>
          ← Quay lại
        </Link>
        <div className="text-xs" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-gold)', fontStyle: 'italic' }}>
          {entity.type === 'person' ? '👤 Nhân vật lịch sử' : '⚔ Sự kiện lịch sử'} · {entity.period}
        </div>
      </header>

      {/* ===== MAIN LAYOUT: 2 cột ===== */}
      <div className="relative z-10 min-h-screen flex items-start">

        {/* ===== LEFT: Thông tin ===== */}
        <div className="flex-1 px-6 lg:px-8 pt-6 pb-16 max-w-xl content-slide-in">

          {/* Tên nhân vật */}
          <h1 className="display text-4xl lg:text-5xl font-bold mb-2 leading-tight" style={{ color: 'var(--clr-ink)' }}>
            {entity.name}
          </h1>
          {entity.born && entity.died && (
            <p className="text-sm mb-4" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {entity.born} – {entity.died}
            </p>
          )}

          {/* Divider */}
          <div className="divider-ancient mb-5 max-w-xs"><span>❋</span></div>

          {/* Mô tả ngắn */}
          <p className="text-base leading-relaxed mb-6"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
            {entity.short_desc}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {entity.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs"
                style={{ background: 'rgba(184,134,11,0.12)', color: 'var(--clr-gold)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', fontFamily: 'var(--font-serif)' }}>
                {tag}
              </span>
            ))}
            {entity.roles?.map(role => (
              <span key={role} className="px-3 py-1 text-xs"
                style={{ background: 'rgba(45,106,79,0.1)', color: 'var(--clr-jade)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: '2px' }}>
                {role}
              </span>
            ))}
          </div>

          {/* ===== TABS ===== */}
          <div className="flex gap-1 mb-6 p-1 w-fit rounded-sm"
            style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.2)' }}>
            {['overview', 'timeline', 'sources'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 text-sm transition-all"
                style={{
                  fontFamily: 'var(--font-serif)',
                  borderRadius: '2px',
                  ...(activeTab === tab
                    ? { background: 'var(--clr-vermillion)', color: 'white', boxShadow: '0 2px 6px rgba(192,57,43,0.3)' }
                    : { background: 'transparent', color: 'var(--clr-ink-soft)' })
                }}>
                {tab === 'overview' ? 'Tổng quan' : tab === 'timeline' ? 'Timeline' : 'Nguồn'}
              </button>
            ))}
          </div>

          {/* ===== TAB CONTENT — trong card giấy ===== */}
          <div className="card-ancient p-6 mb-6" style={{ background: 'rgba(245,239,224,0.88)', backdropFilter: 'blur(4px)' }}>
            {/* --- TAB: TỔNG QUAN --- */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Nút bắt đầu trò chuyện */}
                <div>
                  <p className="text-xs mb-3 font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-sans)' }}>
                    Chọn góc nhìn để trò chuyện
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(entity.perspectives || {}).map(([key, val], idx) => (
                      <button key={key}
                        onClick={() => navigate(`/chat/${id}?perspective=${key}`)}
                        className="px-4 py-2 text-sm transition-all"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          borderRadius: '2px',
                          ...(idx === 0
                            ? { background: 'var(--clr-vermillion)', color: 'white', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 8px rgba(192,57,43,0.35)' }
                            : { background: 'transparent', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.4)' })
                        }}
                        onMouseEnter={e => { if (idx !== 0) e.currentTarget.style.background = 'rgba(184,134,11,0.1)' }}
                        onMouseLeave={e => { if (idx !== 0) e.currentTarget.style.background = 'transparent' }}>
                        {val.persona}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Related people */}
                {entity.related_people?.length > 0 && (
                  <div>
                    <p className="text-xs mb-2 font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-sans)' }}>Nhân vật liên quan</p>
                    <div className="flex flex-wrap gap-2">
                      {entity.related_people.map(personId => {
                        const related = getEntity(personId)
                        return (
                          <Link key={personId} to={`/entity/${personId}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm transition"
                            style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.2)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(232,220,200,0.6)'}>
                            <span>👤</span>
                            <span>{related ? related.name : personId.replace(/-/g, ' ')}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- TAB: TIMELINE --- */}
            {activeTab === 'timeline' && (
              <div className="relative pl-8 space-y-4">
                <div className="absolute left-4 top-0 bottom-0 w-0.5"
                  style={{ background: 'linear-gradient(to bottom, var(--clr-gold), transparent)' }} />
                {entity.timeline?.map((item, i) => (
                  <div key={i} className="relative animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="absolute -left-5 top-1 w-3 h-3 rounded-full"
                      style={{ background: 'var(--clr-gold)', boxShadow: '0 0 8px rgba(184,134,11,0.5)' }} />
                    <span className="text-xs font-bold block mb-0.5" style={{ color: 'var(--clr-vermillion)' }}>{item.year}</span>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>{item.event}</p>
                  </div>
                ))}
              </div>
            )}

            {/* --- TAB: NGUỒN --- */}
            {activeTab === 'sources' && (
              <div className="space-y-3">
                {entity.chunks?.map(chunk => (
                  <div key={chunk.id} className="p-4"
                    style={{ background: 'rgba(232,220,200,0.4)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                    <p className="text-sm leading-relaxed mb-2"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>{chunk.content}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5"
                        style={{ background: 'rgba(45,106,79,0.15)', color: 'var(--clr-jade)', borderRadius: '2px' }}>
                        {chunk.source}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--clr-gold)' }}>
                        Độ tin cậy: {chunk.reliability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: Nhân vật lớn ===== */}
        <div className="hidden lg:flex flex-col items-center justify-end w-96 xl:w-[480px] min-h-screen pt-4 pb-0 pr-4 flex-shrink-0 relative">
          {/* Glow dưới chân nhân vật */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-16 rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(184,134,11,0.25), transparent)', filter: 'blur(12px)' }} />

          {/* Nhân vật */}
          <img
            src={getCharacterUrl(id)}
            alt={entity.name}
            className="character-hero relative z-10"
            style={{
              height: 'min(75vh, 680px)',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'top center',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      </div>

      {/* Bottom band */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-1"
        style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
    </div>
  )
}