import { useState, useCallback, useEffect, useRef } from 'react'

const TOAST_DURATION = 4000
let toastId = 0

const toastStore = {
  listeners: new Set(),
  toasts: [],
  addToast(toast) {
    this.toasts = [...this.toasts, { ...toast, id: ++toastId }]
    this.listeners.forEach((fn) => fn(this.toasts))
  },
  removeToast(id) {
    this.toasts = this.toasts.filter((t) => t.id !== id)
    this.listeners.forEach((fn) => fn(this.toasts))
  },
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  },
}

export function toast(message, type = 'info') {
  toastStore.addToast({ message, type })
}

export function toastSuccess(message) {
  toast(message, 'success')
}

export function toastError(message) {
  toast(message, 'error')
}

export function toastWarning(message) {
  toast(message, 'warning')
}

export function useToast() {
  const [toasts, setToasts] = useState(toastStore.toasts)
  const timersRef = useRef(new Map())

  useEffect(() => {
    return toastStore.subscribe((newToasts) => {
      setToasts(newToasts)
    })
  }, [])

  const dismiss = useCallback((id) => {
    toastStore.removeToast(id)
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  useEffect(() => {
    toasts.forEach((t) => {
      if (!timersRef.current.has(t.id)) {
        const timer = setTimeout(() => dismiss(t.id), TOAST_DURATION)
        timersRef.current.set(t.id, timer)
      }
    })

    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [toasts, dismiss])

  return { toasts, dismiss }
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  const typeStyles = {
    success: { background: 'rgba(45,106,79,0.15)', border: 'rgba(45,106,79,0.4)', color: 'var(--clr-jade)', icon: '✓' },
    error: { background: 'rgba(192,57,43,0.15)', border: 'rgba(192,57,43,0.4)', color: 'var(--clr-vermillion)', icon: '✕' },
    warning: { background: 'rgba(184,134,11,0.15)', border: 'rgba(184,134,11,0.4)', color: 'var(--clr-gold)', icon: '⚠' },
    info: { background: 'rgba(26,15,10,0.1)', border: 'rgba(26,15,10,0.3)', color: 'var(--clr-ink)', icon: 'ℹ' },
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const style = typeStyles[t.type] || typeStyles.info
        return (
          <div
            key={t.id}
            className="pointer-events-auto p-4 rounded-sm animate-in flex items-start gap-3"
            style={{
              background: style.background,
              border: '1px solid ' + style.border,
              color: style.color,
              fontFamily: 'var(--font-serif)',
              fontSize: '0.875rem',
            }}
          >
            <span className="font-bold flex-shrink-0">{style.icon}</span>
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
