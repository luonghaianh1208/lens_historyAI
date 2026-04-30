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
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing oldest data')
        try {
          localStorage.removeItem(key)
          localStorage.setItem(key, JSON.stringify(value))
          setStoredValue(value)
        } catch {
          console.error('Failed to write to localStorage')
        }
      }
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Failed to write to sessionStorage:', error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
