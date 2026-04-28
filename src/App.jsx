import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Entity from './pages/Entity'
import Chat from './pages/Chat'
import Quiz from './pages/Quiz'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entity/:id" element={<Entity />} />
        <Route path="/chat/:entityId" element={<Chat />} />
        <Route path="/quiz/:entityId" element={<Quiz />} />
      </Routes>
    </div>
  )
}

export default App