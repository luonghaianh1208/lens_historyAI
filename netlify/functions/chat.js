import { createRequire } from 'node:module'
import { buildSystemPrompt } from '../../src/services/geminiApi.js'

const require = createRequire(import.meta.url)
const rawEntities = {
  'nguyen-trai': require('../../src/data/entities/nguyen-trai.json'),
  'le-loi': require('../../src/data/entities/le-loi.json'),
  'tran-hung-dao': require('../../src/data/entities/tran-hung-dao.json'),
  'ly-thuong-kiet': require('../../src/data/entities/ly-thuong-kiet.json'),
  'khoi-nghia-lam-son': require('../../src/data/events/khoi-nghia-lam-son.json'),
  'chien-thang-bach-dang': require('../../src/data/events/chien-thang-bach-dang.json'),
  'chien-tranh-ly-tong': require('../../src/data/events/chien-tranh-ly-tong.json'),
  'nguyen-hue': require('../../src/data/entities/nguyen-hue.json'),
  'ho-chi-minh': require('../../src/data/entities/ho-chi-minh.json'),
  'tran-dong-da': require('../../src/data/events/tran-dong-da.json'),
  'dien-bien-phu': require('../../src/data/events/dien-bien-phu.json'),
  'vo-nguyen-giap': require('../../src/data/entities/vo-nguyen-giap.json'),
}

// Load manifest for fallback entities (those without full JSON files)
const manifest = require('../../src/data/manifest.json')

const CHAT_MAX_TOKENS = 20000
const QUIZ_MAX_TOKENS = 2000

function normalizePerspectives(perspectives = {}) {
  return Object.fromEntries(
    Object.entries(perspectives).map(([key, value]) => [
      key,
      {
        ...value,
        system_prompt: value.system_prompt || value.instruction || '',
      },
    ]),
  )
}

function normalizeChunks(chunks = []) {
  return chunks.map((chunk, index) => ({
    id: chunk.id || `${chunk.source || chunk.metadata || 'chunk'}-${index}`,
    content: chunk.content || '',
    source: chunk.source || chunk.metadata || 'Tư liệu tổng hợp',
    reliability: chunk.reliability ?? 88,
    tags: chunk.tags || [],
  }))
}

function normalizeEntity(entity) {
  return {
    ...entity,
    period: entity.period || entity.dynasty || entity.dates || '',
    short_desc: entity.short_desc || entity.shortDescription || entity.description || '',
    perspectives: normalizePerspectives(entity.perspectives || {}),
    chunks: normalizeChunks(entity.chunks || []),
  }
}

const entities = Object.fromEntries(
  Object.entries(rawEntities).map(([id, entity]) => [id, normalizeEntity(entity)]),
)

// Build fallback entities from manifest (for entities without full JSON files)
function buildFallbackEntity(meta) {
  const isEvent = meta.type === 'event'
  const name = meta.name
  const period = meta.period || ''
  const desc = meta.short_desc || ''

  return {
    id: meta.id,
    name,
    type: meta.type,
    period,
    short_desc: desc,
    tags: meta.tags || [],
    chunks: desc ? [{ id: 'desc-0', content: desc, source: 'Manifest', reliability: 70, tags: [] }] : [],
    perspectives: {
      self: {
        name: isEvent ? `Người kể sự kiện ${name}` : name,
        system_prompt: isEvent
          ? `Bạn là nhân chứng sống của ${name} (${period}). ${desc}. Hãy kể lại như người trong cuộc.`
          : `Bạn là ${name} (${period}). ${desc}. Hãy trả lời như chính bạn — nhân vật lịch sử Việt Nam.`,
      },
      historian: {
        name: 'Sử gia',
        system_prompt: `Bạn là sử gia chuyên nghiên cứu về ${name} (${period}). ${desc}. Phân tích khách quan, trích dẫn nguồn khi có thể.`,
      },
      contemporary: {
        name: isEvent ? 'Người cùng thời' : `Người cùng thời với ${name}`,
        system_prompt: isEvent
          ? `Bạn là người dân sống trong giai đoạn ${name} (${period}). ${desc}. Kể lại từ góc nhìn người cùng thời.`
          : `Bạn là người sống cùng thời với ${name} (${period}). ${desc}. Kể lại từ góc nhìn đương thời.`,
      },
    },
  }
}

function getEntity(id) {
  // Try full entities first, then fallback to manifest
  if (entities[id]) return entities[id]

  const meta = manifest.entities?.find(e => e.id === id)
  if (meta) return buildFallbackEntity(meta)

  return null
}

function clampTokens(value, fallback, max) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

// --- Prompt injection protection ---
const MAX_USER_MESSAGE_LENGTH = 2000
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /forget\s+(all\s+)?previous/i,
  /disregard\s+(all\s+)?(above|previous)/i,
  /you\s+are\s+now\s+a/i,
  /new\s+instructions?:/i,
  /system\s*:/i,
  /\bact\s+as\b/i,
  /\bjailbreak\b/i,
  /\bDAN\b/,
  /pretend\s+you\s+are/i,
]

function sanitizeUserInput(text) {
  if (typeof text !== 'string') return ''
  // Trim and limit length
  let sanitized = text.trim().slice(0, MAX_USER_MESSAGE_LENGTH)
  // Strip common injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[đã lọc]')
  }
  return sanitized
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message) => (
      message
      && typeof message.content === 'string'
      && (message.role === 'user' || message.role === 'assistant')
    ))
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.role === 'user' ? sanitizeUserInput(message.content) : message.content }],
    }))
}

function buildQuizPrompt(entity) {
  const info = entity.chunks?.map((chunk) => chunk.content).join('\n') || entity.short_desc || ''

  return `Dựa trên thông tin lịch sử về ${entity.name}, hãy tạo 5 câu hỏi trắc nghiệm bằng tiếng Việt.

THÔNG TIN:
Tên: ${entity.name}
Thời kỳ: ${entity.period || ''}
Mô tả: ${entity.short_desc || ''}
${info}

YÊU CẦU:
- Mỗi câu hỏi có 4 đáp án
- Chỉ có 1 đáp án đúng (index 0-3)
- Câu hỏi kiểm tra sự hiểu biết về sự kiện hoặc chi tiết lịch sử
- Trả lời CHỈ JSON array, không có text khác:
[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`
}

// Netlify Functions v2 format
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { mode = 'chat', entityId, perspective, messages, maxTokens = 1000, stream = false } = await req.json()

  const apiKey = Netlify.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let contents = []
  let systemPrompt = ''
  let resolvedMaxTokens = 1000

  if (mode === 'chat') {
    const entity = getEntity(entityId)
    if (!entity) {
      return new Response(JSON.stringify({ error: 'Entity not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!entity.perspectives?.[perspective]) {
      return new Response(JSON.stringify({ error: 'Perspective not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    contents = normalizeMessages(messages)
    if (contents.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    systemPrompt = buildSystemPrompt(entity, perspective)
    resolvedMaxTokens = clampTokens(maxTokens, 1000, CHAT_MAX_TOKENS)
  } else if (mode === 'quiz') {
    const entity = getEntity(entityId)
    if (!entity) {
      return new Response(JSON.stringify({ error: 'Entity not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    systemPrompt = 'Bạn là chuyên gia lịch sử Việt Nam. Tạo câu hỏi trắc nghiệm chính xác. Trả lời CHỈ JSON array, không markdown, không text thừa.'
    contents = [{ role: 'user', parts: [{ text: buildQuizPrompt(entity) }] }]
    resolvedMaxTokens = clampTokens(maxTokens, 1200, QUIZ_MAX_TOKENS)
  } else {
    return new Response(JSON.stringify({ error: 'Unsupported mode' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const model = 'gemini-1.5-flash'
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}`

  const body = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: resolvedMaxTokens,
      temperature: 0.9
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  })

  try {
    if (stream && mode === 'chat') {
      const response = await fetch(`${baseUrl}:streamGenerateContent?key=${apiKey}&alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })

      if (!response.ok) {
        const error = await response.text()
        return new Response(JSON.stringify({ error: 'Gemini API error: ' + error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Pass through the SSE stream from Gemini
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    // Non-streaming
    const response = await fetch(`${baseUrl}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })

    if (!response.ok) {
      const error = await response.text()
      return new Response(JSON.stringify({ error: 'Gemini API error: ' + error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Gemini API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to call Gemini API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
