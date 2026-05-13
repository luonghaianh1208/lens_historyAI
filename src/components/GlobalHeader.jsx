import { useState } from 'react'
import { Link } from 'react-router-dom'
import UserMenu from './UserMenu'
import AuthModal from './AuthModal'

export default function GlobalHeader() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <>
      <header className="border-b glass-panel w-full relative z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div
              className="w-10 h-10 rounded-full border border-amber-900/30 overflow-hidden flex items-center justify-center bg-white shadow-sm"
            >
              <img src="/logo.png" alt="HistoryLens Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="display text-lg font-bold leading-none" style={{ color: 'var(--clr-ink)' }}>
                HistoryLens
              </h1>
              <p className="text-xs" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                Lịch sử Việt Nam · AI
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4 text-sm" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink-soft)' }}>
              <Link to="/" className="transition hover:text-amber-700">Trang chủ</Link>
              <span style={{ color: 'var(--clr-gold)' }}>·</span>
              <Link to="/learning-paths" className="transition hover:text-amber-700">Lộ trình học</Link>
              <span style={{ color: 'var(--clr-gold)' }}>·</span>
              <Link to="/news" className="transition hover:text-amber-700">Tin tức</Link>
              <span style={{ color: 'var(--clr-gold)' }}>·</span>
              <Link to="/forum" className="transition hover:text-amber-700">Diễn đàn</Link>
            </nav>
            <div className="h-4 w-px hidden md:block" style={{ background: 'var(--clr-gold)', opacity: 0.3 }} />
            <UserMenu onOpenAuth={() => setAuthModalOpen(true)} />
          </div>
        </div>
      </header>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
