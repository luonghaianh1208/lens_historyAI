const API_URL = '/.netlify/functions/chat'

export async function callClaude({ systemPrompt, messages, maxTokens = 1000 }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, maxTokens })
  })
  return response.json()
}

export async function streamClaude({ systemPrompt, messages, maxTokens = 1000 }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages, maxTokens, stream: true })
  })
  return response
}

export function buildSystemPrompt(entity, perspective, lengthLevel) {
  const perspectiveConfig = entity.perspectives?.[perspective] || entity.perspectives?.self
  const lengthGuide = {
    short: 'Trả lời 5–8 câu.',
    medium: 'Trả lời 3–5 đoạn.',
    long: 'Trả lời đầy đủ: bối cảnh → diễn biến → hệ quả → nhận xét sử học.'
  }[lengthLevel] || 'Trả lời 3–5 đoạn.'

  const chunksContent = entity.chunks?.map((c, i) =>
    `[${i + 1}] ${c.content} (Nguồn: ${c.source})`
  ).join('\n') || ''

  return `${perspectiveConfig.system_prompt}

NGUỒN TÀI LIỆU (chỉ dùng thông tin từ đây):
${chunksContent}

QUY TẮC BẮT BUỘC:
- Mọi khẳng định phải có citation [số] cuối câu
- Nếu thông tin không có trong nguồn, nói rõ: "Không có đủ tư liệu để khẳng định điều này"
- Phân biệt rõ: SỰ KIỆN (có nguồn) vs DIỄN GIẢI (suy luận hợp lý)
- ${lengthGuide}
- Trả lời hoàn toàn bằng tiếng Việt
`.trim()
}