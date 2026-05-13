import newsSources from '../data/news-sources.json'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes
const cache = new Map()

export async function fetchNewsByCategory(categoryId) {
  const cacheKey = `news_${categoryId}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data
  }

  const sources = categoryId === 'all'
    ? newsSources.sources
    : newsSources.sources.filter(s => s.category === categoryId)

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const res = await fetch(`/api/news-feed?url=${encodeURIComponent(source.rssUrl)}`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.items || []).map(item => ({
        ...item,
        sourceName: source.name,
        category: source.category
      }))
    })
  )

  const allItems = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate) : 0
      const db = b.pubDate ? new Date(b.pubDate) : 0
      return db - da
    })

  cache.set(cacheKey, { data: allItems, ts: Date.now() })
  return allItems
}

export function getCategories() {
  return newsSources.categories
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return date.toLocaleDateString('vi-VN')
}
