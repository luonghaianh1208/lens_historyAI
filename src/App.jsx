import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Entity = lazy(() => import('./pages/Entity'))
const Chat = lazy(() => import('./pages/Chat'))
const Quiz = lazy(() => import('./pages/Quiz'))

function AppShellFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--clr-paper)', color: 'var(--clr-ink-soft)' }}
    >
      <div className="card-ancient px-6 py-5 text-center max-w-md w-full">
        <p className="display text-lg mb-2" style={{ color: 'var(--clr-ink)' }}>
          HistoryLens AI
        </p>
        <p className="text-sm" style={{ fontFamily: 'var(--font-serif)' }}>
          Đang chuẩn bị không gian học lịch sử...
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<AppShellFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entity/:id" element={<Entity />} />
          <Route path="/chat/:entityId" element={<Chat />} />
          <Route path="/quiz/:entityId" element={<Quiz />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
