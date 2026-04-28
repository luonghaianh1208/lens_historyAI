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
        short: 'Trả lời ngắn gọn trong 4–6 câu. Đi thẳng vào điểm chính, không lan man.',
        medium: `Trả lời 3–4 đoạn văn đầy đủ. Mỗi đoạn có chủ đề rõ ràng.
Cấu trúc gợi ý: (1) Trả lời trực tiếp câu hỏi, (2) Bối cảnh/chi tiết, (3) Ý nghĩa/đánh giá.`,
        long: `Trả lời toàn diện và sâu sắc, tối thiểu 5–7 đoạn văn.
Cấu trúc: (1) Mở đầu trả lời câu hỏi, (2) Bối cảnh lịch sử, (3) Diễn biến chi tiết,
(4) Các góc nhìn khác nhau, (5) Hệ quả/tác động, (6) Nhận xét sử học, (7) Kết luận.
Dùng tiêu đề in đậm **Tiêu đề:** để phân chia các phần khi cần.`
    }[lengthLevel] || 'Trả lời 3–4 đoạn văn đầy đủ.'

    const chunks = entity.chunks || []
    const chunkContext = chunks.length > 0
        ? `\n\nTÀI LIỆU THAM KHẢO (ưu tiên dùng thông tin này):\n${chunks.map((c, i) => `[${i + 1}] ${c.content} (Nguồn: ${c.source})`).join('\n')}`
        : ''

    return `${perspectiveConfig.system_prompt}

Bạn là chuyên gia lịch sử Việt Nam với kiến thức sâu rộng từ thời Hùng Vương đến hiện đại.
Trả lời chính xác dựa trên kiến thức lịch sử đã được giới sử học công nhận.
Nếu không chắc chắn về một chi tiết, nói rõ đây là suy đoán hoặc cần xác minh thêm.
Phân biệt rõ: SỰ KIỆN (đã xác nhận bởi sử liệu) vs DIỄN GIẢI (suy luận hợp lý từ bối cảnh).
${lengthGuide}

LƯU Ý QUAN TRỌNG NHẤT:
- Tuyệt đối không được để câu trả lời bị cắt ngang, lửng lơ giữa chừng.
- Luôn phải canh chỉnh nội dung sao cho kết thúc trọn vẹn một ý, một đoạn văn, hoặc một câu hoàn chỉnh. Nếu sắp hết dung lượng, hãy tóm tắt nhanh và kết thúc bằng dấu chấm câu.
- Trả lời hoàn toàn bằng tiếng Việt. Dùng markdown để định dạng (in đậm tên người, sự kiện quan trọng).${chunkContext}`.trim()
}
