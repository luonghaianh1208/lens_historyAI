import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    let nextValue

    try {
      nextValue = value instanceof Function ? value(storedValue) : value
      setStoredValue(nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded")
        try {
          localStorage.removeItem(key)
          localStorage.setItem(key, JSON.stringify(nextValue))
          setStoredValue(nextValue)
        } catch {
          console.error("Failed to write to localStorage")
        }
      }
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
