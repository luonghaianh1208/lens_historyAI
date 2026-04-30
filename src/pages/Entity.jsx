import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEntity, getAllEntities } from '../services/retrieval'
import { getBackgroundUrl, getCharacterUrl } from '../services/assetService'
import AnimatedBackground from '../components/AnimatedBackground'
import ScrollToTop from '../components/ScrollToTop'
import { SkeletonHero } from '../components/SkeletonLoader'

function buildLearningHighlights(entity) {
  const timeline = entity.timeline || []
  const perspectives = Object.values(entity.perspectives || {})
  return [
    {
      title: 'Bạn sẽ nắm được',
      content: entity.short_desc,
    },
    {
      title: 'Mốc trọng tâm',
      content: timeline.slice(0, 2).map((item) => item.year + ': ' + item.event).join(' · ') || entity.period,
    },
    {
      title: 'Góc nhìn để hỏi',
      content: perspectives.slice(0, 2).map((item) => item.persona).join(' · ') || 'Tự thuật · Sử gia',
    },
  ]
}

function getRelatedEntities(entity, allEntities) {
  if (!entity) return []
  const related = new Map()

  const addEntity = (e, reason) => {
    if (e && e.id !== entity.id && !related.has(e.id)) {
      related.set(e.id, { ...e, reason })
    }
  }

  ;(entity.related_people || []).forEach((id) => {
    const found = allEntities.find((e) => e.id === id)
    if (found) addEntity(found, 'Nhân vật liên quan')
  })

  ;(entity.related_events || []).forEach((id) => {
    const found = allEntities.find((e) => e.id === id)
    if (found) addEntity(found, 'Sự kiện liên quan')
  })

  allEntities.forEach((e) => {
    if (e.id !== entity.id && e.period === entity.period) {
      addEntity(e, 'Cùng thời kỳ')
    }
  })

  return Array.from(related.values()).slice(0, 6)
}

export default function Entity({ onOpenSearch }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const entity = getEntity(id)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const allEntities = useMemo(() => getAllEntities(), [])
  const relatedEntities = useMemo(() => entity ? getRelatedEntities(entity, allEntities) : [], [entity, allEntities])
  const highlights = useMemo(() => (entity ? buildLearningHighlights(entity) : []), [entity])

  useMemo(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [id])

  if (!entity) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--clr-paper)' }}>
        <div className="interactive-surface text-center card-ancient p-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Không tìm thấy</h2>
          <Link to="/" className="hover:underline" style={{ color: 'var(--clr-vermillion)' }}>Quay lại trang chủ</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell min-h-screen overflow-hidden" style={{ background: 'var(--clr-paper)' }}>
      <AnimatedBackground entityId={id} />

      <div className="interactive-surface">
        <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
        <div className="fixed bottom-0 left-0 right-0 z-50 h-1" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

        <header className="absolute top-0 left-0 right-0 z-30 px-6 pt-5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-sm transition group glass-panel"
            style={{ borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Quay lại</span>
          </Link>

          <div className="flex items-center gap-2">
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                className="px-3 py-2 text-sm glass-panel"
                style={{ borderRadius: '2px', color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}
                aria-label="Mở tìm kiếm"
              >
                🔍
              </button>
            )}
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-xs glass-panel"
              style={{ borderRadius: '2px', color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
            >
              <span>{entity.type === 'person' ? '👤' : '⚔'}</span>
              <span>{entity.period}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <SkeletonHero />
        ) : (
          <>
            <section className="relative w-full" style={{ minHeight: 'min(760px, 88vh)' }}>
              <div className="hero-backdrop" style={{ backgroundImage: 'url(' + getBackgroundUrl(id) + ')' }} />

              <div className="absolute top-[18%] left-0 right-0 z-10 text-center px-6 pointer-events-none">
                <p className="text-xs tracking-[0.4em] uppercase mb-3 opacity-70" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
                  {entity.type === 'person' ? '· Nhân vật lịch sử ·' : '· Sự kiện lịch sử ·'}
                </p>
                <h1 className="display title-glow font-bold leading-none" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', color: 'var(--clr-ink)', letterSpacing: '0.02em' }}>
                  {entity.name}
                </h1>
                {entity.born && entity.died && (
                  <p className="mt-3 text-base tracking-widest" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                    {entity.born} — {entity.died}
                  </p>
                )}
                <div className="divider-ancient mt-5 max-w-md mx-auto opacity-80"><span className="text-base">❋</span></div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 character-stage">
                <div className="character-floor" />
                <img
                  src={getCharacterUrl(id)}
                  alt={entity.name}
                  className="character-blend character-hero relative z-10"
                  style={{ height: 'min(65vh, 620px)', width: 'auto', objectFit: 'contain', objectPosition: 'bottom center', display: 'block' }}
                  loading="eager"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            </section>

            <section className="relative z-10 max-w-5xl mx-auto px-6 -mt-16 pb-20">
              <div className="hero-summary-grid mb-6">
                {highlights.map((item) => (
                  <article key={item.title} className="card-ancient p-5">
                    <p className="section-kicker mb-3">{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                      {item.content}
                    </p>
                  </article>
                ))}
              </div>

              <div className="scroll-paper ancient-frame px-6 md:px-10 py-10 md:py-12 relative">
                <div className="corner-ornament corner-tl" />
                <div className="corner-ornament corner-tr" />
                <div className="corner-ornament corner-bl" />
                <div className="corner-ornament corner-br" />

                <div className="max-w-3xl mx-auto">
                  <p className="text-lg leading-relaxed mb-6 text-center" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                    {entity.short_desc}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {entity.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs"
                        style={{ background: 'rgba(184,134,11,0.12)', color: 'var(--clr-gold)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', fontFamily: 'var(--font-serif)' }}
                      >
                        {tag}
                      </span>
                    ))}
                    {entity.roles?.map((role) => (
                      <span
                        key={role}
                        className="px-3 py-1 text-xs"
                        style={{ background: 'rgba(45,106,79,0.1)', color: 'var(--clr-jade)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: '2px' }}
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button type="button" onClick={() => navigate('/chat/' + id)} className="btn-seal">
                      Trò chuyện ngay
                    </button>
                    <button type="button" onClick={() => navigate('/quiz/' + id)} className="btn-seal-ghost">
                      Ôn tập bằng quiz
                    </button>
                  </div>

                  <div className="divider-ancient mb-8"><span>◈</span></div>

                  <div className="flex flex-wrap gap-2 mb-8 justify-center p-1 rounded-sm" style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.2)' }}>
                    {[
                      { key: 'overview', label: 'Tổng quan' },
                      { key: 'timeline', label: 'Niên biểu' },
                      { key: 'sources', label: 'Nguồn' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className="px-5 py-2 text-sm"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          borderRadius: '2px',
                          ...(activeTab === tab.key
                            ? { background: 'var(--clr-vermillion)', color: '#fff', boxShadow: '0 2px 6px rgba(192,57,43,0.3)' }
                            : { background: 'transparent', color: 'var(--clr-ink-soft)' }),
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[200px]">
                    {activeTab === 'overview' && (
                      <div className="space-y-8">
                        <div>
                          <p className="section-kicker text-center mb-3">Chọn góc nhìn để trò chuyện</p>
                          <div className="flex flex-wrap justify-center gap-3">
                            {Object.entries(entity.perspectives || {}).map(([key, value], index) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => navigate('/chat/' + id + '?perspective=' + key)}
                                className={'perspective-btn relative ' + (index === 0 ? 'btn-seal' : 'btn-seal-ghost')}
                              >
                                {value.persona}
                                <span className="perspective-tooltip">{value.persona}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {entity.related_people?.length > 0 && (
                          <div>
                            <p className="section-kicker text-center mb-3">Nhân vật liên quan</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {entity.related_people.map((personId) => {
                                const related = getEntity(personId)
                                return (
                                  <Link
                                    key={personId}
                                    to={'/entity/' + personId}
                                    className="chip-button flex items-center gap-2 px-4 py-2 text-sm"
                                    style={{ background: 'rgba(232,220,200,0.6)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}
                                  >
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
                        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, var(--clr-gold), transparent)' }} />
                        {entity.timeline?.map((item, index) => (
                          <div key={item.year + '-' + index} className="relative animate-in" style={{ animationDelay: (index * 0.06) + 's' }}>
                            <div className="absolute -left-7 top-1.5 w-3 h-3 rounded-full" style={{ background: 'var(--clr-gold)', boxShadow: '0 0 12px rgba(184,134,11,0.5)' }} />
                            <span className="text-sm font-bold block mb-1" style={{ color: 'var(--clr-vermillion)' }}>{item.year}</span>
                            <p className="text-base" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>{item.event}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'sources' && (
                      <div className="space-y-3 max-w-2xl mx-auto">
                        {entity.chunks?.map((chunk) => (
                          <div key={chunk.id} className="p-5" style={{ background: 'rgba(232,220,200,0.45)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                            <p className="text-base leading-relaxed mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
                              {chunk.content}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-1" style={{ background: 'rgba(45,106,79,0.15)', color: 'var(--clr-jade)', borderRadius: '2px' }}>
                                📜 {chunk.source}
                              </span>
                              <span className="text-xs px-2 py-1" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--clr-gold)', borderRadius: '2px' }}>
                                Độ tin cậy: {chunk.reliability}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {relatedEntities.length > 0 && (
                <section className="max-w-5xl mx-auto px-6 mt-12">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="section-kicker mb-1">Khám phá thêm</p>
                      <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Bạn có thể thích</h3>
                    </div>
                  </div>
                  <div className="related-entities-scroll">
                    {relatedEntities.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => navigate('/entity/' + rel.id)}
                        className="card-ancient p-4 text-left"
                      >
                        <div className="text-xl mb-2">{rel.type === 'person' ? '👤' : '⚔️'}</div>
                        <p className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                          {rel.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--clr-gold)' }}>{rel.period}</p>
                        <p className="text-xs mt-2" style={{ color: 'var(--clr-ink-soft)', opacity: 0.7 }}>{rel.reason}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </section>
          </>
        )}
      </div>
      <ScrollToTop />
    </div>
  )
}
