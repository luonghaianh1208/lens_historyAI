const API_URL = '/.netlify/functions/chat'

export async function callGemini({ systemPrompt, messages, maxTokens = 1000 }) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages, maxTokens })
    })
    return response.json()
}

export async function streamGemini({ systemPrompt, messages, maxTokens = 1000 }) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages, maxTokens, stream: true })
    })
    return response
}

export function buildSystemPrompt(entity, perspective, lengthLevel) {
    const perspectiveConfig = entity.perspectives?.[perspective]
    if (!perspectiveConfig) return ''

    const lengthGuide = {
        short: 'Trả lời ngắn gọn 5–8 câu.',
        medium: 'Trả lời 3–5 đoạn vừa.',
        long: 'Trả lời đầy đủ: bối cảnh → diễn biến → hệ quả → nhận xét sử học.'
    }[lengthLevel] || 'Trả lời 3–5 đoạn vừa.'

    return `${perspectiveConfig.system_prompt}

Bạn là chuyên gia lịch sử Việt Nam với kiến thức sâu rộng từ thời Hùng Vương đến hiện đại.
Trả lời chính xác dựa trên kiến thức lịch sử đã được giới sử học công nhận.
Nếu không chắc chắn về một chi tiết, nói rõ đây là suy đoán hoặc cần xác minh thêm.
Phân biệt rõ: SỰ KIỆN (đã xác nhận bởi sử liệu) vs DIỄN GIẢI (suy luận hợp lý từ bối cảnh).
${lengthGuide}
Trả lời hoàn toàn bằng tiếng Việt.`.trim()
}
