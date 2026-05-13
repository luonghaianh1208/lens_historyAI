// Netlify serverless function: fetch & parse RSS feeds (proxy to avoid CORS)
export default async (req) => {
  const url = new URL(req.url)
  const feedUrl = url.searchParams.get('url')

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'Missing url param' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'HistoryLens-AI-Bot/1.0' }
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `RSS fetch failed: ${res.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const xml = await res.text()
    const items = parseRSS(xml)

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600' // 10 min cache
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function parseRSS(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    const pubDate = extractTag(block, 'pubDate')
    const description = extractTag(block, 'description')
    const thumbnail = extractThumbnail(block)

    if (title && link) {
      items.push({
        title: cleanCDATA(title),
        link: cleanCDATA(link).trim(),
        pubDate: pubDate || '',
        description: cleanHTML(cleanCDATA(description || '')),
        thumbnail
      })
    }
  }
  return items.slice(0, 20) // max 20 items per feed
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m = xml.match(regex)
  return m ? m[1] : ''
}

function extractThumbnail(block) {
  // Try media:content or enclosure
  const mediaMatch = block.match(/url=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))/i)
  if (mediaMatch) return mediaMatch[1]

  // Try img in description
  const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return ''
}

function cleanCDATA(str) {
  return str.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim()
}

function cleanHTML(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim().slice(0, 200)
}

export const config = {
  path: '/api/news-feed'
}
