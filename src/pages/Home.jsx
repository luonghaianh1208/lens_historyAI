import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getIndex, searchEntities } from '../services/retrieval'
import { getCharacterUrl } from '../services/assetService'
import AnimatedBackground from '../components/AnimatedBackground'

const FEATURED = [
  { id: 'nguyen-trai', label: 'Nguyá»…n TrÃ£i', era: 'Háº­u LÃª sÆ¡' },
  { id: 'tran-hung-dao', label: 'Tráº§n HÆ°ng Äáº¡o', era: 'NhÃ  Tráº§n' },
  { id: 'ly-thuong-kiet', label: 'LÃ½ ThÆ°á»ng Kiá»‡t', era: 'NhÃ  LÃ½' },
]

const START_STEPS = [
  {
    title: 'Chá»n má»™t nhÃ¢n váº­t',
    body: 'Báº¯t Ä‘áº§u tá»« má»™t chÃ¢n dung lá»‹ch sá»­, xem má»‘c chÃ­nh vÃ  bá»‘i cáº£nh trÆ°á»›c khi trÃ² chuyá»‡n.',
  },
  {
    title: 'Äáº·t cÃ¢u há»i theo gÃ³c nhÃ¬n',
    body: 'So sÃ¡nh tá»± thuáº­t, ngÆ°á»i cÃ¹ng thá»i vÃ  sá»­ gia Ä‘á»ƒ tháº¥y lá»‹ch sá»­ khÃ´ng chá»‰ cÃ³ má»™t giá»ng ká»ƒ.',
  },
  {
    title: 'Ã”n táº­p báº±ng quiz',
    body: 'Chuyá»ƒn tá»« Ä‘á»c sang nhá»› báº±ng bá»™ cÃ¢u há»i sinh theo Ä‘Ãºng nhÃ¢n váº­t hoáº·c sá»± kiá»‡n báº¡n vá»«a há»c.',
  },
]

export default function Home({ onOpenSearch }) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [hoveredChar, setHoveredChar] = useState(FEATURED[0].id)
  const navigate = useNavigate()

  const results = useMemo(() => searchEntities(query), [query])
  const entities = useMemo(() => getIndex(), [])

  const openResultList = () => {
    if (query.trim()) setShowResults(true)
  }

  const handleSelect = (id) => {
    setShowResults(false)
    setQuery('')
    navigate(`/entity/${id}`)
  }

  const quickSearch = (value) => {
    setQuery(value)
    setShowResults(true)
  }

  return (
    <div className="page-shell min-h-screen overflow-hidden" style={{ background: 'var(--clr-paper)' }}>
      <AnimatedBackground entityId="default" />

      <div className="interactive-surface">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

        <header className="border-b glass-panel">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg"
                style={{ borderColor: 'var(--clr-gold)', color: 'var(--clr-gold)' }}
              >
                â˜¯
              </div>
              <div>
                <h1 className="display text-lg font-bold leading-none" style={{ color: 'var(--clr-ink)' }}>
                  HistoryLens
                </h1>
                <p className="text-xs" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  Lá»‹ch sá»­ Viá»‡t Nam Â· AI
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
              <Link to="/" className="transition hover:text-amber-700">Trang chá»§</Link>
              <span style={{ color: 'var(--clr-gold)' }}>Â·</span>
              <span className="text-xs" style={{ color: 'var(--clr-gold)' }}>Nháº­p vai Â· Há»i Ä‘Ã¡p Â· Quiz</span>
            </nav>
          </div>
        </header>

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
                <span>âš”</span> KhÃ¡m phÃ¡ lá»‹ch sá»­ qua Ä‘á»‘i thoáº¡i AI
              </div>

              <h2 className="display text-4xl md:text-5xl font-bold leading-tight mb-3" style={{ color: 'var(--clr-ink)' }}>
                Há»c lá»‹ch sá»­
                <br />
                qua gÃ³c nhÃ¬n nhÃ¢n váº­t
              </h2>

              <div className="divider-ancient mb-6 max-w-xs">
                <span>â‹</span>
              </div>

              <p className="mb-8 text-base leading-relaxed max-w-xl" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
                Báº¯t Ä‘áº§u tá»« má»™t nhÃ¢n váº­t hoáº·c sá»± kiá»‡n, xem má»‘c quan trá»ng, rá»“i chuyá»ƒn sang trÃ² chuyá»‡n vÃ  quiz trong cÃ¹ng má»™t hÃ nh trÃ¬nh há»c táº­p ngáº¯n gá»n.
              </p>

              <div className="relative max-w-xl">
                <label className="section-kicker block mb-2">TÃ¬m nhÃ¢n váº­t hoáº·c sá»± kiá»‡n</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowResults(Boolean(e.target.value.trim()))
                  }}
                  onFocus={openResultList}
                  placeholder="VÃ­ dá»¥: Nguyá»…n TrÃ£i, Äiá»‡n BiÃªn Phá»§..."
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
                  aria-label="Má»Ÿ tÃ¬m kiáº¿m"
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
                          <span style={{ color: 'var(--clr-gold)' }}>{entity.type === 'person' ? 'ðŸ‘¤' : 'âš”'}</span>
                          <div>
                            <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                              {entity.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                        KhÃ´ng cÃ³ káº¿t quáº£ khá»›p. Thá»­ tÃ¬m theo tÃªn nhÃ¢n váº­t, triá»u Ä‘áº¡i hoáº·c sá»± kiá»‡n lá»›n.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {['Nguyá»…n TrÃ£i', 'Tráº§n HÆ°ng Äáº¡o', 'LÃª Lá»£i', 'Äiá»‡n BiÃªn Phá»§'].map((name) => (
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
                  Báº¯t Ä‘áº§u vá»›i Nguyá»…n TrÃ£i
                </button>
                <button type="button" onClick={() => handleSelect('tran-hung-dao')} className="btn-ghost text-sm">
                  Xem Tráº§n HÆ°ng Äáº¡o
                </button>
                <button type="button" onClick={() => handleSelect('dien-bien-phu')} className="btn-ghost text-sm">
                  Há»c qua sá»± kiá»‡n
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
              <span className="display text-sm px-4" style={{ color: 'var(--clr-gold)' }}>HÃ nh trÃ¬nh há»c</span>
            </div>
            <div className="home-journey-grid">
              {START_STEPS.map((step, index) => (
                <article key={step.title} className="card-ancient p-5">
                  <p className="section-kicker mb-3">BÆ°á»›c {index + 1}</p>
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
                <p className="section-kicker mb-2">ThÆ° má»¥c nhÃ¢n váº­t vÃ  sá»± kiá»‡n</p>
                <h3 className="display text-2xl" style={{ color: 'var(--clr-ink)' }}>KhÃ¡m phÃ¡ theo chá»§ Ä‘á»</h3>
              </div>
              <p className="hidden md:block text-sm max-w-lg text-right" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                Má»—i tháº» dáº«n tá»›i má»™t há»“ sÆ¡ cÃ³ tÃ³m táº¯t, má»‘c thá»i gian, nguá»“n tham kháº£o vÃ  cÃ¡c gÃ³c nhÃ¬n sáºµn sÃ ng Ä‘á»ƒ há»i Ä‘Ã¡p.
              </p>
            </div>
            <EntityGrid entities={entities} navigate={navigate} />
          </section>
        </main>

        <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
      </div>
    </div>
  )
}

function EntityGrid({ entities, navigate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {entities.map((entity) => (
        <button
          key={entity.id}
          type="button"
          onClick={() => navigate(`/entity/${entity.id}`)}
          className="entity-card-button card-ancient p-4 text-left group"
          style={{ boxShadow: '0 2px 8px rgba(26,15,10,0.08)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl mb-2">{entity.type === 'person' ? 'ðŸ‘¤' : 'âš”ï¸'}</div>
              <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                {entity.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
            </div>
            <span className="text-xs opacity-70" style={{ color: 'var(--clr-gold)' }}>Má»Ÿ</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {entity.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--clr-ink-soft)', borderRadius: '2px' }}>
                {tag}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
}

