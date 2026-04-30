import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchEntities, getIndex } from '../services/retrieval'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState('all')
  const [recentSearches, setRecentSearches] = useLocalStorage('historylens-recent-searches', [])
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const allResults = searchEntities(query)
    if (filter === 'all') return allResults
    return allResults.filter((e) => e.type === filter)
  }, [query, filter])

  const allItems = useMemo(() => {
    if (query.trim()) return results
    return recentSearches.map((id) => {
      const all = getIndex()
      return all.find((e) => e.id === id)
    }).filter(Boolean)
  }, [query, results, recentSearches])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useKeyboardShortcut('k', () => {
    if (isOpen) onClose()
  }, { ctrl: true })

  useKeyboardShortcut('Escape', onClose)

  const handleSelect = (entity) => {
    const newRecents = [entity.id, ...recentSearches.filter((id) => id !== entity.id)].slice(0, 5)
    setRecentSearches(newRecents)
    setQuery('')
    onClose()
    navigate('/entity/' + entity.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault()
      handleSelect(allItems[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="fixed inset-0" style={{ background: 'rgba(26,15,10,0.4)', backdropFilter: 'blur(4px)' }} />

      <div
        className="relative w-full max-w-lg animate-in"
        style={{ zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-ancient overflow-hidden" style={{ boxShadow: '0 12px 40px rgba(26,15,10,0.25)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
            <div className="flex items-center gap-3">
              <span style={{ color: 'var(--clr-gold)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                onKeyDown={handleKeyDown}
                placeholder="Tìm nhân vật, sự kiện lịch sử..."
                className="flex-1 bg-transparent outline-none text-base"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}
              />
              <kbd className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(184,134,11,0.1)', color: 'var(--clr-gold)', border: '1px solid rgba(184,134,11,0.2)' }}>
                ESC
              </kbd>
            </div>

            <div className="flex gap-2 mt-3">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'person', label: 'Nhân vật' },
                { key: 'event', label: 'Sự kiện' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => { setFilter(f.key); setSelectedIndex(0) }}
                  className="px-3 py-1 text-xs rounded-sm"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    background: filter === f.key ? 'var(--clr-vermillion)' : 'transparent',
                    color: filter === f.key ? '#fff' : 'var(--clr-ink-soft)',
                    border: '1px solid ' + (filter === f.key ? 'transparent' : 'rgba(184,134,11,0.25)'),
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={resultsRef} className="max-h-80 overflow-auto">
            {allItems.length > 0 ? (
              allItems.map((entity, index) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => handleSelect(entity)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  style={{
                    borderColor: 'rgba(184,134,11,0.1)',
                    background: index === selectedIndex ? 'rgba(184,134,11,0.08)' : 'transparent',
                  }}
                >
                  <span className="text-lg">{entity.type === 'person' ? '👤' : '⚔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
                      {entity.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--clr-gold)' }}>{entity.period}</p>
                  </div>
                  <span className="text-xs opacity-50" style={{ color: 'var(--clr-gold)' }}>Mở →</span>
                </button>
              ))
            ) : query.trim() ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                  Không tìm thấy kết quả cho "{query}"
                </p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="px-4 py-3 text-xs" style={{ color: 'var(--clr-gold)', fontFamily: 'var(--font-serif)' }}>
                Tìm kiếm gần đây
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
                  Bắt đầu gõ để tìm kiếm...
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 text-xs flex items-center gap-4" style={{ color: 'var(--clr-ink-soft)', borderTop: '1px solid rgba(184,134,11,0.1)' }}>
            <span>↑↓ Chọn</span>
            <span>Enter Mở</span>
            <span>ESC Đóng</span>
          </div>
        </div>
      </div>
    </div>
  )
}
