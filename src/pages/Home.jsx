import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchEntities, getIndex } from '../services/retrieval'
import { getCharacterUrl } from '../services/assetService'

const FEATURED = [
  { id: 'nguyen-trai',    label: 'Nguyễn Trãi',     era: 'Hậu Lê sơ' },
  { id: 'tran-hung-dao',  label: 'Trần Hưng Đạo',   era: 'Nhà Trần'  },
  { id: 'ly-thuong-kiet', label: 'Lý Thường Kiệt',  era: 'Nhà Lý'    },
]

export default function Home() {
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState([])
  const [showResults, setShowResults] = useState(false)
  const [hoveredChar, setHoveredChar] = useState(FEATURED[0].id)
  const navigate = useNavigate()

  const handleSearch = (value) => {
    setQuery(value)
    if (value.trim()) {
      setResults(searchEntities(value))
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }

  const handleSelect = (id) => {
    setShowResults(false)
    setQuery('')
    navigate(`/entity/${id}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--clr-paper)' }}>

      {/* ===== DECORATIVE TOP BAND ===== */}
      <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--clr-vermillion), var(--clr-gold), var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />

      {/* ===== HEADER ===== */}
      <header className="relative z-10 border-b" style={{ borderColor: 'rgba(184,134,11,0.2)', background: 'rgba(245,239,224,0.9)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo trống đồng */}
            <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-lg"
              style={{ borderColor: 'var(--clr-gold)', color: 'var(--clr-gold)' }}>
              ☯
            </div>
            <div>
              <h1 className="display text-lg font-bold leading-none" style={{ color: 'var(--clr-ink)' }}>
                HistoryLens
              </h1>
              <p className="text-xs" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                Lịch sử Việt Nam · AI
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
            <Link to="/" className="hover:text-amber-700 transition">Trang chủ</Link>
            <span style={{ color: 'var(--clr-gold)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--clr-gold)' }}>Nhập vai · Học lịch sử · Quiz</span>
          </nav>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main className="relative">

        {/* Background texture SVG */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='28' stroke='%23b8860b' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='20' stroke='%23b8860b' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='30' r='12' stroke='%23b8860b' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '60px 60px' }} />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT — Text + Search */}
          <div className="relative z-10 animate-in">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-sm text-xs"
              style={{ background: 'rgba(184,134,11,0.12)', border: '1px solid rgba(184,134,11,0.3)', color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
              <span>⚔</span> Khám phá lịch sử qua đối thoại AI
            </div>

            <h2 className="display text-4xl md:text-5xl font-bold leading-tight mb-2"
              style={{ color: 'var(--clr-ink)' }}>
              Nhập vai<br />
              <span style={{ color: 'var(--clr-vermillion)' }}>Nhân vật</span>
            </h2>
            <h2 className="display text-4xl md:text-5xl font-bold leading-tight mb-6"
              style={{ color: 'var(--clr-ink)' }}>
              Lịch sử Việt Nam
            </h2>

            {/* Divider */}
            <div className="divider-ancient mb-6 max-w-xs">
              <span>❋</span>
            </div>

            <p className="mb-8 text-base leading-relaxed" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
              Trò chuyện với Nguyễn Trãi, Trần Hưng Đạo, Lê Lợi... qua góc nhìn tự thuật,
              người cùng thời và sử gia hiện đại.
            </p>

            {/* Search box */}
            <div className="relative max-w-lg">
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm nhân vật hoặc sự kiện..."
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
              <button className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--clr-gold)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Results */}
              {showResults && results.length > 0 && (
                <div className="absolute w-full mt-1 z-50 overflow-hidden"
                  style={{ background: 'var(--clr-paper)', border: '1px solid rgba(184,134,11,0.3)', borderRadius: '2px', boxShadow: '0 8px 24px rgba(26,15,10,0.15)' }}>
                  {results.map((entity) => (
                    <button key={entity.id} onClick={() => handleSelect(entity.id)}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-amber-50 transition"
                      style={{ borderBottom: '1px solid rgba(184,134,11,0.1)' }}>
                      <span style={{ color: 'var(--clr-gold)' }}>{entity.type === 'person' ? '👤' : '⚔'}</span>
                      <div>
                        <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{entity.name}</p>
                        <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Nguyễn Trãi', 'Trần Hưng Đạo', 'Lê Lợi', 'Khởi nghĩa Lam Sơn'].map(name => (
                <button key={name} onClick={() => handleSearch(name)}
                  className="px-3 py-1 text-xs transition"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)', border: '1px solid rgba(184,134,11,0.25)', borderRadius: '2px', background: 'transparent' }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--clr-gold)'}
                  onMouseLeave={e => e.target.style.borderColor = 'rgba(184,134,11,0.25)'}>
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Character showcase */}
          <div className="relative hidden md:flex justify-center items-end h-96">
            {FEATURED.map((char, i) => (
              <div
                key={char.id}
                className="absolute bottom-0 cursor-pointer transition-all duration-500"
                style={{
                  left: `${i * 28}%`,
                  zIndex: hoveredChar === char.id ? 10 : i,
                  transform: hoveredChar === char.id ? 'scale(1.08) translateY(-8px)' : 'scale(0.88)',
                  opacity: hoveredChar === char.id ? 1 : 0.65,
                }}
                onMouseEnter={() => setHoveredChar(char.id)}
                onClick={() => navigate(`/entity/${char.id}`)}
              >
                <img
                  src={getCharacterUrl(char.id)}
                  alt={char.label}
                  className="character-float h-72 object-contain"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                {hoveredChar === char.id && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center animate-ink">
                    <p className="text-sm font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{char.label}</p>
                    <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{char.era}</p>
                  </div>
                )}
              </div>
            ))}
            {/* Decorative ground line */}
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--clr-gold), transparent)' }} />
          </div>
        </div>

        {/* ===== ENTITY GRID ===== */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="divider-ancient mb-8"><span className="display text-sm px-4" style={{ color: 'var(--clr-gold)' }}>Nhân vật & Sự kiện</span></div>
          <EntityGrid navigate={navigate} />
        </section>
      </main>

      {/* Bottom band */}
      <div className="h-1 w-full mt-8" style={{ background: 'linear-gradient(90deg, var(--clr-jade), var(--clr-gold), var(--clr-vermillion))' }} />
    </div>
  )
}

function EntityGrid({ navigate }) {
  const entities = getIndex()
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {entities.map((entity) => (
        <button key={entity.id} onClick={() => navigate(`/entity/${entity.id}`)}
          className="card-ancient p-4 text-left transition-all duration-300 hover:-translate-y-1 group"
          style={{ boxShadow: '0 2px 8px rgba(26,15,10,0.08)' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,15,10,0.15)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,15,10,0.08)'}
          >
          <div className="text-xl mb-2">{entity.type === 'person' ? '👤' : '⚔️'}</div>
          <p className="font-semibold text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>{entity.name}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {entity.tags?.slice(0,2).map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--clr-ink-soft)', borderRadius: '2px' }}>{tag}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
}