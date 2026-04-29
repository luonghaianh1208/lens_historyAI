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

      {/* ===== TOP/BOTTOM BAND ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1"
        style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
      <div className="fixed bottom-0 left-0 right-0 z-50 h-1"
        style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

      {/* ===== HEADER FLOATING ===== */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 pt-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm transition group"
          style={{ background: 'rgba(245,239,224,0.85)', border: '1px solid rgba(184,134,11,0.4)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)', backdropFilter: 'blur(12px)' }}>
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          <span>Quay lại</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs"
          style={{ background: 'rgba(245,239,224,0.85)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', backdropFilter: 'blur(12px)' }}>
          {entity.type === 'person' ? '👤' : '⚔'}
          <span>{entity.period}</span>
        </div>
      </header>

      {/* ===== HERO SECTION — nhân vật + cảnh ===== */}
      <section className="relative w-full" style={{ height: '85vh', minHeight: 600 }}>

        {/* Cảnh nền */}
        <div className="hero-backdrop" style={{ backgroundImage: `url(${getBackgroundUrl(id)})` }} />

        {/* Tên nhân vật khổng lồ — overlay trên cảnh */}
        <div className="absolute top-1/4 left-0 right-0 z-10 text-center px-6 pointer-events-none">
          <p className="text-xs tracking-[0.4em] uppercase mb-3 opacity-70"
            style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
            {entity.type === 'person' ? '· Nhân vật lịch sử ·' : '· Sự kiện lịch sử ·'}
          </p>
          <h1 className="display title-glow font-bold leading-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              color: 'var(--clr-ink)',
              letterSpacing: '0.02em',
            }}>
            {entity.name}
          </h1>
          {entity.born && entity.died && (
            <p className="mt-3 text-base tracking-widest"
              style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {entity.born} — {entity.died}
            </p>
          )}
          <div className="divider-ancient mt-5 max-w-md mx-auto opacity-80"><span className="text-base">❋</span></div>
        </div>

        {/* Nhân vật đứng giữa, vào tận đáy */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 character-stage">
          {/* Sàn dưới chân */}
          <div className="character-floor" />

          {/* Ảnh nhân vật — KỸ THUẬT XÓA NỀN TRẮNG BẰNG BLEND */}
          <img
            src={getCharacterUrl(id)}
            alt={entity.name}
            className="character-blend character-hero relative z-10"
            style={{
              height: 'min(70vh, 620px)',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              display: 'block',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Scroll indicator dưới hero */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
          <span className="text-xs tracking-widest uppercase"
            style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>Cuộn xuống</span>
          <span style={{ color: 'var(--clr-gold)' }}>↓</span>
        </div>
      </section>

      {/* ===== CONTENT — CUỘN THƯ MỞ RA ===== */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 -mt-16 pb-20">

        {/* Cuộn thư chính */}
        <div className="scroll-paper ancient-frame px-10 py-12 relative">
          <div className="corner-ornament corner-tl" />
          <div className="corner-ornament corner-tr" />
          <div className="corner-ornament corner-bl" />
          <div className="corner-ornament corner-br" />

          {/* Mô tả */}
          <p className="text-lg leading-relaxed mb-6 text-center max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
            {entity.short_desc}
          </p>

          {/* Tags + Roles */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {entity.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs"
                style={{ background: 'rgba(184,134,11,0.12)', color: 'var(--clr-gold)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', fontFamily: 'var(--font-serif)' }}>
                {tag}
              </span>
            ))}
            {entity.roles?.map(role => (
              <span key={role} className="px-3 py-1 text-xs"
                style={{ background: 'rgba(45,106,79,0.1)', color: 'var(--clr-jade)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: '2px' }}>
                {role}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="divider-ancient mb-8"><span>◈</span></div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 w-fit mx-auto rounded-sm"
            style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.2)' }}>
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'timeline', label: 'Niên biểu' },
              { key: 'sources',  label: 'Nguồn' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2 text-sm transition-all"
                style={{
                  fontFamily: 'var(--font-serif)',
                  borderRadius: '2px',
                  ...(activeTab === tab.key
                    ? { background: 'var(--clr-vermillion)', color: 'white', boxShadow: '0 2px 6px rgba(192,57,43,0.3)' }
                    : { background: 'transparent', color: 'var(--clr-ink-soft)' })
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[200px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs mb-3 font-semibold uppercase tracking-widest text-center"
                    style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-sans)' }}>
                    Chọn góc nhìn để trò chuyện
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(entity.perspectives || {}).map(([key, val], idx) => (
                      <button key={key}
                        onClick={() => navigate(`/chat/${id}?perspective=${key}`)}
                        className={idx === 0 ? "btn-seal" : "btn-seal-ghost"}>
                        {val.persona}
                      </button>
                    ))}
                  </div>
                </div>

                {entity.related_people?.length > 0 && (
                  <div>
                    <p className="text-xs mb-3 font-semibold uppercase tracking-widest text-center"
                      style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-sans)' }}>
                      Nhân vật liên quan
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {entity.related_people.map(personId => {
                        const related = getEntity(personId)
                        return (
                          <Link key={personId} to={`/entity/${personId}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm transition"
                            style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,134,11,0.12)'}
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

            {activeTab === 'timeline' && (
              <div className="relative pl-10 max-w-2xl mx-auto space-y-5">
                <div className="absolute left-4 top-0 bottom-0 w-0.5"
                  style={{ background: 'linear-gradient(to bottom, var(--clr-gold), transparent)' }} />
                {entity.timeline?.map((item, i) => (
                  <div key={i} className="relative animate-in" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full"
                      style={{ background: 'var(--clr-gold)', boxShadow: '0 0 12px rgba(184,134,11,0.5)' }} />
                    <span className="text-sm font-bold block mb-1" style={{ color: 'var(--clr-vermillion)' }}>{item.year}</span>
                    <p className="text-base" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>{item.event}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="space-y-3 max-w-2xl mx-auto">
                {entity.chunks?.map(chunk => (
                  <div key={chunk.id} className="p-5"
                    style={{ background: 'rgba(232,220,200,0.45)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                    <p className="text-base leading-relaxed mb-3"
                      style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>{chunk.content}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1"
                        style={{ background: 'rgba(45,106,79,0.15)', color: 'var(--clr-jade)', borderRadius: '2px' }}>
                        📜 {chunk.source}
                      </span>
                      <span className="text-xs px-2 py-1"
                        style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--clr-gold)', borderRadius: '2px' }}>
                        Độ tin cậy: {chunk.reliability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}