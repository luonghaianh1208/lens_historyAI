import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getIndex, searchEntities, getPeriods } from '../services/retrieval'
import { getCharacterUrl } from '../services/assetService'
import AnimatedBackground from '../components/AnimatedBackground'
import { track } from '../services/analytics'
import GlobalHeader from '../components/GlobalHeader'

const FEATURED = [
  { id: 'nguyen-trai', label: 'Nguyễn Trãi', era: 'Hậu Lê sơ' },
  { id: 'tran-hung-dao', label: 'Trần Hưng Đạo', era: 'Nhà Trần' },
  { id: 'ly-thuong-kiet', label: 'Lý Thường Kiệt', era: 'Nhà Lý' },
]

const START_STEPS = [
  {
    title: 'Chọn một nhân vật',
    body: 'Bắt đầu từ một chân dung lịch sử, xem mốc chính và bối cảnh trước khi trò chuyện.',
  },
  {
    title: 'Đặt câu hỏi theo góc nhìn',
    body: 'So sánh tự thuật, người cùng thời và sử gia để thấy lịch sử không chỉ có một giọng kể.',
  },
  {
    title: 'Ôn tập bằng quiz',
    body: 'Chuyển từ đọc sang nhớ bằng bộ câu hỏi sinh theo đúng nhân vật hoặc sự kiện bạn vừa học.',
  },
]

export default function Home({ onOpenSearch }) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [hoveredChar, setHoveredChar] = useState(FEATURED[0].id)
  const [expandedPeriods, setExpandedPeriods] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    track('page_view', { path: '/' })
  }, [])

  const entities = useMemo(() => getIndex(), [])
  const periods = useMemo(() => getPeriods(), [])
  const results = useMemo(() => (query.trim() ? searchEntities(query) : []), [query])

  const togglePeriod = (periodId) => {
    setExpandedPeriods(prev =>
      prev.includes(periodId)
        ? prev.filter(id => id !== periodId)
        : [...prev, periodId]
    )
  }

  const handleSelect = (id) => {
    setQuery('')
    setShowResults(false)
    navigate(`/entity/${id}`)
  }

  const quickSearch = (name) => {
    setQuery(name)
    setShowResults(true)
  }

  const openResultList = () => {
    if (query.trim()) setShowResults(true)
  }

  // Group entities by period
  const entitiesByPeriod = useMemo(() => {
    const groups = new Map()
    periods.forEach(period => {
      groups.set(period.id, {
        period,
        entities: period.entities
          .map(id => entities.find(e => e.id === id))
          .filter(Boolean)
      })
    })
    return groups
  }, [periods, entities])

  return (
    <div className="page-container relative min-h-screen">
      <AnimatedBackground />

      <div className="interactive-surface">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

        <GlobalHeader />

        <main className="relative">
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'28\' stroke=\'%23b8860b\' stroke-width=\'0.5\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'20\' stroke=\'%23b8860b\' stroke-width=\'0.5\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'12\' stroke=\'%23b8860b\' stroke-width=\'0.5\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px',
            }}
          />

          <section className="max-w-6xl mx-auto px-6 pt-14 pb-8 grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="relative z-10 animate-in">
              <div
                className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-sm text-xs"
                style={{ background: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}
              >
                <span>⚔</span> Khám phá lịch sử qua đối thoại AI
              </div>

              <h2 className="display text-4xl md:text-5xl font-bold leading-tight mb-3" style={{ color: 'var(--clr-ink)' }}>
                Học lịch sử
                <br />
                qua góc nhìn nhân vật
              </h2>

              <div className="divider-ancient mb-6 max-w-xs">
                <span>❋</span>
              </div>

              <p className="mb-8 text-base leading-relaxed max-w-xl" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
                Bắt đầu từ một nhân vật hoặc sự kiện, xem mốc quan trọng, rồi chuyển sang trò chuyện và quiz trong cùng một hành trình học tập ngắn gọn.
              </p>

              <div className="relative max-w-xl">
                <label className="section-kicker block mb-2">Tìm nhân vật hoặc sự kiện</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowResults(Boolean(e.target.value.trim()))
                  }}
                  onFocus={openResultList}
                  placeholder="Ví dụ: Nguyễn Trãi, Điện Biên Phủ..."
                  className="w-full px-5 py-3.5 text-base outline-none"
                  style={{
                    background: 'rgba(245,239,224,0.95)',
                    border: '1px solid rgba(184,134,11,0.5)',
                    borderRadius: '2px',
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--clr-ink)',
                    boxShadow: '0 2px 12px rgba(26,15,10,0.1)',
                  }}
                />
                <button
                  type="button"
                  className="ghost-icon-button absolute right-3 top-[2.55rem] -translate-y-1/2 p-1"
                  style={{ color: 'var(--clr-gold)' }}
                  aria-label="Mở tìm kiếm"
                  onClick={onOpenSearch || undefined}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {showResults && (
                  <div
                    className="absolute w-full mt-1 z-50 overflow-hidden card-ancient"
                    style={{ boxShadow: '0 8px 24px rgba(26,15,10,0.15)' }}
                  >
                    {results.length > 0 ? (
                      results.slice(0, 6).map((entity) => (
                        <button
                          key={entity.id}
                          type="button"
                          onClick={() => handleSelect(entity.id)}
                          className="search-result-button w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0"
                          style={{ borderColor: 'rgba(184,134,11,0.1)' }}
                        >
                          <span style={{ color: 'var(--clr-gold)' }}>{entity.type === 'person' ? '👤' : '⚔'}</span>
                          <div>
                            <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                              {entity.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                        Không có kết quả khớp. Thử tìm theo tên nhân vật, triều đại hoặc sự kiện lớn.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {['Nguyễn Trãi', 'Trần Hưng Đạo', 'Lê Lợi', 'Điện Biên Phủ'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => quickSearch(name)}
                    className="chip-button px-3 py-1 text-xs"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', background: 'transparent' }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-8">
                <button type="button" onClick={() => handleSelect('nguyen-trai')} className="btn-primary text-sm">
                  Bắt đầu với Nguyễn Trãi
                </button>
                <button type="button" onClick={() => handleSelect('tran-hung-dao')} className="btn-ghost text-sm">
                  Xem Trần Hưng Đạo
                </button>
                <button type="button" onClick={() => handleSelect('dien-bien-phu')} className="btn-ghost text-sm">
                  Học qua sự kiện
                </button>
              </div>
            </div>

            <div className="relative hidden md:flex justify-center items-end h-[28rem]">
              {FEATURED.map((char, index) => (
                <button
                  key={char.id}
                  type="button"
                  className="absolute bottom-0 transition-all duration-500"
                  style={{
                    left: `${index * 28}%`,
                    zIndex: hoveredChar === char.id ? 10 : index,
                    transform: hoveredChar === char.id ? 'scale(1.08) translateY(-8px)' : 'scale(0.88)',
                    opacity: hoveredChar === char.id ? 1 : 0.65,
                  }}
                  onMouseEnter={() => setHoveredChar(char.id)}
                  onFocus={() => setHoveredChar(char.id)}
                  onClick={() => navigate(`/entity/${char.id}`)}
                >
                  <img
                    src={getCharacterUrl(char.id)}
                    alt={char.label}
                    className="character-float h-72 object-contain"
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  {hoveredChar === char.id && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center animate-ink">
                      <p className="text-sm font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                        {char.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{char.era}</p>
                    </div>
                  )}
                </button>
              ))}
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--clr-gold), transparent)' }} />
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 py-6">
            <div className="divider-ancient mb-8">
              <span className="display text-sm px-4" style={{ color: 'var(--clr-gold)' }}>Hành trình học</span>
            </div>
            <div className="home-journey-grid">
              {START_STEPS.map((step, index) => (
                <article key={step.title} className="card-ancient p-5">
                  <p className="section-kicker mb-3">Bước {index + 1}</p>
                  <h3 className="text-lg mb-2" style={{ color: 'var(--clr-ink)' }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <p className="section-kicker mb-2">Thư mục nhân vật và sự kiện</p>
                <h3 className="display text-2xl" style={{ color: 'var(--clr-ink)' }}>Khám phá theo thời đại</h3>
              </div>
              <p className="hidden md:block text-sm max-w-lg text-right" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                Mỗi thẻ dẫn tới một hồ sơ có tóm tắt, mốc thời gian, nguồn tham khảo và các góc nhìn sẵn sàng để hỏi đáp.
              </p>
            </div>

            <div className="space-y-6">
              {Array.from(entitiesByPeriod.values())
                .filter(group => group.entities.length > 0)
                .map(({ period, entities: periodEntities }) => (
                  <TimelinePeriod
                    key={period.id}
                    period={period}
                    entities={periodEntities}
                    expanded={expandedPeriods.includes(period.id)}
                    onToggle={() => togglePeriod(period.id)}
                    navigate={navigate}
                  />
                ))
              }
            </div>
          </section>
        </main>

        <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
      </div>

    </div>
  )
}

function TimelinePeriod({ period, entities, expanded, onToggle, navigate }) {
  return (
    <div className="card-ancient overflow-hidden" style={{ borderLeft: `3px solid ${period.colorTheme.primary}` }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors"
        style={{ background: `linear-gradient(90deg, ${period.colorTheme.primary}15 0%, transparent 100%)` }}
      >
        <div>
          <h4 className="display text-lg font-bold mb-1" style={{ color: period.colorTheme.primary }}>
            {period.name}
          </h4>
          <p className="text-xs" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
            {formatYearRange(period.startYear, period.endYear)}
            {period.description && ` · ${period.description}`}
          </p>
        </div>
        <span className="text-sm" style={{ color: period.colorTheme.primary }}>
          {expanded ? '▼' : '▶'} {entities.length} nhân vật/sự kiện
        </span>
      </button>

      {expanded && (
        <div className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {entities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => navigate(`/entity/${entity.id}`)}
                className="entity-card-button p-3 text-left text-sm group"
                style={{ background: 'rgba(245,239,224,0.7)' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{entity.type === 'person' ? '👤' : '⚔️'}</span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                      {entity.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                    {entity.short_desc && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--clr-ink-soft)' }}>
                        {entity.short_desc}
                      </p>
                    )}
                  </div>
                </div>
                {entity.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entity.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5" style={{ background: 'rgba(184,134,11,0.15)', color: 'var(--clr-ink-soft)', borderRadius: '2px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatYearRange(startYear, endYear) {
  const formatBC = (year) => {
    if (year < 0) {
      return `${Math.abs(year)} TCN`
    }
    return `${year}`
  }
  return `${formatBC(startYear)} - ${formatBC(endYear)}`
}
