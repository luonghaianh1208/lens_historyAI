import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEntity } from '../services/retrieval'
import { getBackgroundUrl, getCharacterUrl, getBgStyle } from '../services/assetService'

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

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'sources', label: 'Nguồn' },
  ]

  const getPeriodDisplay = () => {
    if (entity.period) return entity.period
    if (entity.period_start) return `${entity.period_start}${entity.period_end ? '–' + entity.period_end : ''}`
    return entity.type === 'event' ? 'Sự kiện' : ''
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--clr-paper)' }}>

      {/* Decorative top band */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

      {/* ===== HERO with Background + Character ===== */}
      <div className="relative h-64 md:h-80 overflow-hidden" style={getBgStyle(id)}>
        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(245,239,224,0.1) 0%, rgba(245,239,224,0.85) 100%)' }} />

        {/* Back button */}
        <Link to="/" className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 text-sm transition"
          style={{ background: 'rgba(245,239,224,0.85)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
          ← Quay lại
        </Link>

        {/* Character image — bottom right */}
        <img
          src={getCharacterUrl(id)}
          alt={entity.name}
          className="character-float absolute bottom-0 right-8 h-56 md:h-72 object-contain"
          onError={(e) => { e.target.style.display = 'none' }}
        />

        {/* Text overlay */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 text-xs"
            style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.4)', color: 'var(--clr-gold)', borderRadius: '2px', fontFamily: 'var(--font-serif)' }}>
            {entity.type === 'person' ? '👤 Nhân vật lịch sử' : '⚔ Sự kiện lịch sử'} · {getPeriodDisplay()}
          </div>
          <h1 className="display text-3xl md:text-4xl font-bold" style={{ color: 'var(--clr-ink)', textShadow: '0 1px 3px rgba(245,239,224,0.8)' }}>
            {entity.name}
          </h1>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(232,220,200,0.5)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                fontFamily: 'var(--font-serif)',
                ...(activeTab === tab.id
                  ? { background: 'var(--clr-vermillion)', color: 'white', boxShadow: '0 2px 6px rgba(192,57,43,0.3)' }
                  : { background: 'transparent', color: 'var(--clr-ink-soft)' }
                ),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="card-ancient p-6">

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div>
                <p className="text-lg leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{entity.short_desc}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {entity.tags?.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-sm" style={{ background: 'rgba(184,134,11,0.12)', color: 'var(--clr-gold)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles */}
              {entity.roles && (
                <div>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Vai trò</h3>
                  <div className="flex flex-wrap gap-2">
                    {entity.roles.map((role) => (
                      <span key={role} className="px-3 py-1 text-sm" style={{ background: 'rgba(45,106,79,0.1)', color: 'var(--clr-jade)', borderRadius: '2px', border: '1px solid rgba(45,106,79,0.2)' }}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat CTA */}
              <div className="p-6 rounded-sm" style={{ background: 'linear-gradient(135deg, rgba(192,57,43,0.08), rgba(184,134,11,0.08))', border: '1px solid rgba(184,134,11,0.3)' }}>
                <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Bắt đầu trò chuyện</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--clr-ink-soft)' }}>Chọn góc nhìn để trò chuyện với {entity.name}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(entity.perspectives || {}).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => navigate(`/chat/${entity.id}?perspective=${key}`)}
                      className="btn-primary"
                    >
                      {config.persona || key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Related */}
              {entity.related_people?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Nhân vật liên quan</h3>
                  <div className="flex flex-wrap gap-2">
                    {entity.related_people.map((personId) => {
                      const related = getEntity(personId)
                      return (
                        <Link
                          key={personId}
                          to={`/entity/${personId}`}
                          className="px-3 py-2 text-sm transition flex items-center gap-2"
                          style={{ background: 'rgba(245,239,224,0.9)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', color: 'var(--clr-ink-soft)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-gold)'; e.currentTarget.style.color = 'var(--clr-ink)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.25)'; e.currentTarget.style.color = 'var(--clr-ink-soft)' }}
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
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, var(--clr-gold), transparent)' }} />
                <div className="space-y-6">
                  {entity.timeline?.map((item, i) => (
                    <div key={i} className="relative flex gap-4 pl-10">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full" style={{ background: 'var(--clr-gold)', boxShadow: '0 0 8px rgba(184,134,11,0.4)' }} />
                      <div>
                        <div className="font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{item.year}</div>
                        <div style={{ color: 'var(--clr-ink-soft)' }}>{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div>
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>Nguồn tài liệu</h3>
              <div className="space-y-4">
                {entity.chunks?.map((chunk) => (
                  <div key={chunk.id} className="p-4" style={{ background: 'rgba(232,220,200,0.4)', borderRadius: '2px', border: '1px solid rgba(184,134,11,0.15)' }}>
                    <div className="text-sm mb-2" style={{ color: 'var(--clr-gold)' }}>Nguồn: {chunk.source}</div>
                    <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{chunk.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5" style={{ background: 'rgba(45,106,79,0.15)', color: 'var(--clr-jade)', borderRadius: '2px' }}>
                        Độ tin cậy: {chunk.reliability}%
                      </span>
                      {chunk.tags?.map((tag) => (
                        <span key={tag} className="text-xs" style={{ color: 'var(--clr-gold)' }}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom band */}
      <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
    </div>
  )
}