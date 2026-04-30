import { Suspense, lazy, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ToastContainer from './components/Toast'
import SearchModal from './components/SearchModal'
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut'

const Home = lazy(() => import('./pages/Home'))
const Entity = lazy(() => import('./pages/Entity'))
const Chat = lazy(() => import('./pages/Chat'))
const Quiz = lazy(() => import('./pages/Quiz'))

function AppShellFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--clr-paper)", color: "var(--clr-ink-soft)" }}
    >
      <div className="card-ancient px-6 py-5 text-center max-w-md w-full">
        <p className="display text-lg mb-2" style={{ color: "var(--clr-ink)" }}>
          HistoryLens AI
        </p>
        <p className="text-sm" style={{ fontFamily: "var(--font-serif)" }}>
          \u0110ang chu\u1ea9n b\u1ecb kh\u00f4ng gian h\u1ecdc l\u1ecbch s\u1eed...
        </p>
      </div>
    </div>
  )
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useKeyboardShortcut("k", () => {
    setSearchOpen((prev) => !prev)
  }, { ctrl: true })

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Suspense fallback={<AppShellFallback />}>
          <Routes>
            <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} />} />
            <Route path="/entity/:id" element={<Entity onOpenSearch={() => setSearchOpen(true)} />} />
            <Route path="/chat/:entityId" element={<Chat />} />
            <Route path="/quiz/:entityId" element={<Quiz />} />
          </Routes>
        </Suspense>
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <ToastContainer />
      </div>
    </ErrorBoundary>
  )
}

export default App