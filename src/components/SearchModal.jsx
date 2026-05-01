import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchEntities, getIndex } from '../services/retrieval'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState("all")
  const [recentSearches, setRecentSearches] = useLocalStorage("historylens-recent-searches", [])
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const allResults = searchEntities(query)
    if (filter === "all") return allResults
    return allResults.filter((e) => e.type === filter)
  }, [query, filter])

  const entityIndex = useMemo(() => getIndex(), [])

  const allItems = useMemo(() => {
    if (query.trim()) return results
    return recentSearches.map((id) => {
      return entityIndex.find((e) => e.id === id)
    }).filter(Boolean)
  }, [entityIndex, query, results, recentSearches])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  useKeyboardShortcut("Escape", onClose, { enabled: isOpen })

  const handleSelect = (entity) => {
    const newRecents = [entity.id, ...recentSearches.filter((id) => id !== entity.id)].slice(0, 5)
    setRecentSearches(newRecents)
    setQuery("")
    onClose()
    navigate("/entity/" + entity.id)
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault()
      handleSelect(allItems[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div className="fixed inset-0" style={{ background: "rgba(26,15,10,0.4)", backdropFilter: "blur(4px)" }} />

      <div
        className="relative w-full max-w-lg animate-in"
        style={{ zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-ancient overflow-hidden" style={{ boxShadow: "0 12px 40px rgba(26,15,10,0.25)" }}>
          <div className="p-4 border-b" style={{ borderColor: "rgba(184,134,11,0.2)" }}>
            <div className="flex items-center gap-3">
              <span style={{ color: "var(--clr-gold)" }}>
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
                placeholder="T\u00ecm nh\u00e2n v\u1eadt, s\u1ef1 ki\u1ec7n l\u1ecbch s\u1eed..."
                className="flex-1 bg-transparent outline-none text-base"
                style={{ fontFamily: "var(--font-serif)", color: "var(--clr-ink)" }}
              />
              <kbd className="text-xs px-2 py-1 rounded" style={{ background: "rgba(184,134,11,0.1)", color: "var(--clr-gold)", border: "1px solid rgba(184,134,11,0.2)" }}>
                ESC
              </kbd>
            </div>

            <div className="flex gap-2 mt-3">
              {[
                { key: "all", label: "T\u1ea5t c\u1ea3" },
                { key: "person", label: "Nh\u00e2n v\u1eadt" },
                { key: "event", label: "S\u1ef1 ki\u1ec7n" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => { setFilter(f.key); setSelectedIndex(0) }}
                  className="px-3 py-1 text-xs rounded-sm"
                  style={{
                    fontFamily: "var(--font-serif)",
                    background: filter === f.key ? "var(--clr-vermillion)" : "transparent",
                    color: filter === f.key ? "#fff" : "var(--clr-ink-soft)",
                    border: "1px solid " + (filter === f.key ? "transparent" : "rgba(184,134,11,0.25)"),
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-80 overflow-auto">
            {allItems.length > 0 ? (
              allItems.map((entity, index) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => handleSelect(entity)}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors"
                  style={{
                    borderColor: "rgba(184,134,11,0.1)",
                    background: index === selectedIndex ? "rgba(184,134,11,0.08)" : "transparent",
                  }}
                >
                  <span className="text-lg">{entity.type === "person" ? "\ud83d\udc64" : "\u2694"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-serif)", color: "var(--clr-ink)" }}>
                      {entity.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--clr-gold)" }}>{entity.period}</p>
                  </div>
                  <span className="text-xs opacity-50" style={{ color: "var(--clr-gold)" }}>M\u1edf \u2192</span>
                </button>
              ))
            ) : query.trim() ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--clr-ink-soft)", fontFamily: "var(--font-serif)" }}>
                  Kh\u00f4ng t\u00ecm th\u1ea5y k\u1ebft qu\u1ea3 cho "{query}"
                </p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="px-4 py-3 text-xs" style={{ color: "var(--clr-gold)", fontFamily: "var(--font-serif)" }}>
                T\u00ecm ki\u1ebfm g\u1ea7n \u0111\u00e2y
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--clr-ink-soft)", fontFamily: "var(--font-serif)" }}>
                  B\u1eaft \u0111\u1ea7u g\u00f5 \u0111\u1ec3 t\u00ecm ki\u1ebfm...
                </p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 text-xs flex items-center gap-4" style={{ color: "var(--clr-ink-soft)", borderTop: "1px solid rgba(184,134,11,0.1)" }}>
            <span>\u2191\u2193 Ch\u1ecdn</span>
            <span>Enter M\u1edf</span>
            <span>ESC \u0110\u00f3ng</span>
          </div>
        </div>
      </div>
    </div>
  )
}
