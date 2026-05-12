/**
 * Analytics Service (Privacy-First)
 * Tracks user interactions using localStorage (no external dependencies)
 * Can be upgraded to Plausible/Umami later
 */

const STORAGE_KEY = 'historylens-analytics'
const MAX_RECORDS = 1000 // Prevent localStorage overflow

export const AnalyticsEvents = {
  // Page views
  PAGE_VIEW: 'page_view',
  ENTITY_VIEW: 'entity_view',
  QUIZ_START: 'quiz_start',
  QUIZ_COMPLETE: 'quiz_complete',
  QUIZ_SCORE: 'quiz_score',
  CHAT_START: 'chat_start',
  CHAT_MESSAGE: 'chat_message',
  FLASHCARD_REVIEW: 'flashcard_review',
  FLASHCARD_QUALITY: 'flashcard_quality',
  LEARNING_PATH_START: 'learning_path_start',
  LEARNING_PATH_COMPLETE: 'learning_path_complete',
  LEVEL_COMPLETE: 'level_complete',

  // Gamification
  POINTS_EARNED: 'points_earned',
  STREAK_UPDATE: 'streak_update',
}

export function track(event, data = {}) {
  if (typeof window === 'undefined' || !localStorage) {
    return // Server-side or no localStorage
  }

  try {
    const record = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      event,
      sessionId: getSessionId(),
      userId: getUserId(),
      path: window.location.pathname,
      ...data,
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.push(record)

    // Keep only last MAX_RECORDS
    if (existing.length > MAX_RECORDS) {
      existing.splice(0, existing.length - MAX_RECORDS)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))

    // Also update daily aggregates
    updateDailyStats(event, data)

    console.debug('[Analytics]', event, data)
  } catch (error) {
    console.warn('Analytics tracking failed:', error.message)
  }
}

function getSessionId() {
  let sessionId = localStorage.getItem('analytics-session-id')
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('analytics-session-id', sessionId)
  }
  return sessionId
}

function getUserId() {
  // Anonymous user ID based on fingerprint
  let userId = localStorage.getItem('analytics-user-id')
  if (!userId) {
    userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('analytics-user-id', userId)
  }
  return userId
}

function updateDailyStats(event, data) {
  const today = new Date().toDateString()
  const statsKey = 'analytics-daily-stats'
  const stats = JSON.parse(localStorage.getItem(statsKey) || '{}')

  if (!stats[today]) {
    stats[today] = {
      date: today,
      events: {},
      uniquePages: [],
      totalPoints: 0,
    }
  }

  // Ensure uniquePages is always an array (may be object from old data)
  if (!Array.isArray(stats[today].uniquePages)) {
    stats[today].uniquePages = []
  }

  stats[today].events[event] = (stats[today].events[event] || 0) + 1
  if (data.path && !stats[today].uniquePages.includes(data.path)) {
    stats[today].uniquePages.push(data.path)
  }
  if (data.points) {
    stats[today].totalPoints += data.points
  }

  // Keep only last 30 days
  const dates = Object.keys(stats)
  if (dates.length > 30) {
    dates.sort((a, b) => new Date(a) - new Date(b))
    dates.slice(0, dates.length - 30).forEach(date => delete stats[date])
  }

  localStorage.setItem(statsKey, JSON.stringify(stats))
}

export function getAnalyticsData() {
  if (typeof window === 'undefined' || !localStorage) {
    return null
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  const dailyRaw = localStorage.getItem('analytics-daily-stats')

  return {
    events: raw ? JSON.parse(raw) : [],
    dailyStats: dailyRaw ? JSON.parse(dailyRaw) : {},
    sessionId: getSessionId(),
    userId: getUserId(),
  }
}

export function clearAnalytics() {
  if (typeof window !== 'undefined' && localStorage) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('analytics-daily-stats')
    localStorage.removeItem('analytics-session-id')
    localStorage.removeItem('analytics-user-id')
  }
}

export function exportAnalytics() {
  const data = getAnalyticsData()
  if (data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historylens-analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Helper functions for common tracking
export function trackEntityView(entityId, entityName) {
  track(AnalyticsEvents.ENTITY_VIEW, { entityId, entityName, path: `/entity/${entityId}` })
}

export function trackQuizComplete(entityId, score, totalQuestions) {
  track(AnalyticsEvents.QUIZ_COMPLETE, { entityId, score, totalQuestions, path: `/quiz/${entityId}` })
  track(AnalyticsEvents.POINTS_EARNED, { points: score * 5, reason: 'quiz_completion' })
}

export function trackChatMessage(entityId, messageLength, perspective) {
  track(AnalyticsEvents.CHAT_MESSAGE, { entityId, messageLength, perspective })
}

export function trackFlashcardReview(entityId, quality, interval, repetitions) {
  track(AnalyticsEvents.FLASHCARD_REVIEW, { entityId, quality, interval, repetitions })
  if (quality >= 3) {
    track(AnalyticsEvents.POINTS_EARNED, { points: 10, reason: 'flashcard_review' })
  } else {
    track(AnalyticsEvents.POINTS_EARNED, { points: 5, reason: 'flashcard_review' })
  }
}

export function trackLevelComplete(pathId, levelId, bonusPoints) {
  track(AnalyticsEvents.LEVEL_COMPLETE, { pathId, levelId, bonusPoints })
  track(AnalyticsEvents.POINTS_EARNED, { points: bonusPoints, reason: 'level_complete' })
}

export default {
  track,
  getAnalyticsData,
  clearAnalytics,
  exportAnalytics,
  trackEntityView,
  trackQuizComplete,
  trackChatMessage,
  trackFlashcardReview,
  trackLevelComplete,
}
