import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center animate-in"
      style={{
        background: "var(--clr-paper)",
        border: "1px solid rgba(184,134,11,0.3)",
        color: "var(--clr-gold)",
        boxShadow: "0 2px 12px rgba(26,15,10,0.15)",
        fontSize: "1.1rem",
      }}
      aria-label="L\u00ean \u0111\u1ea7u trang"
    >
      \u2191
    </button>
  )
}