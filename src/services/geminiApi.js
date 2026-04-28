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
    const perspectiveConfig = entity.perspectives?.[perspective] || entity.perspectives?.self
    const lengthGuide = {
        short: 'Trả lời ngắn gọn 5–8 câu.',
        medium: 'Trả lời 3–5 đoạn vừa.',
        long: 'Trả lời đầy đủ và chi tiết.'
    }[lengthLevel] || 'Trả lời 3–5 đoạn vừa.'

    return `${perspectiveConfig.system_prompt}

${lengthGuide}
Trả lời hoàn toàn bằng tiếng Việt.
`.trim()
}
