import { useEffect, useRef } from 'react'

export function useKeyboardShortcut(key, callback, options = {}) {
  const callbackRef = useRef(callback)
  const { ctrl = false, meta = false, shift = false, alt = false, preventDefault = true } = options

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handler = (event) => {
      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase()
      const isCtrlMatch = ctrl === (event.ctrlKey || event.metaKey)
      const isShiftMatch = shift === event.shiftKey
      const isAltMatch = alt === event.altKey

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
        if (preventDefault) event.preventDefault()
        callbackRef.current(event)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, ctrl, meta, shift, alt, preventDefault])
}
