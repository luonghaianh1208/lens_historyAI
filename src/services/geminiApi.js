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

export function buildSystemPrompt(entity, perspective) {
    const perspectiveConfig = entity.perspectives?.[perspective]
    if (!perspectiveConfig) return ''

    // Lấy prompt gốc từ JSON — ưu tiên system_prompt, fallback sang instruction
    const basePrompt = perspectiveConfig.system_prompt || perspectiveConfig.instruction || ''

    // === TÀI LIỆU THAM KHẢO ===
    const chunks = entity.chunks || []
    const chunkContext = chunks.length > 0
        ? `\n\nTÀI LIỆU THAM KHẢO (ưu tiên dùng thông tin này, trích nguồn khi phù hợp):\n${chunks.map((c, i) => `[${i + 1}] ${c.content}${c.source ? ` (Nguồn: ${c.source})` : ''}`).join('\n')}`
        : ''

    // === QUY TẮC ỨNG XỬ (áp dụng cho mọi perspective) ===
    const behaviorRules = `
QUY TẮC BẮT BUỘC (tuân thủ nghiêm ngặt):
1. KHÔNG BAO GIỜ tự nhận là AI, chatbot, hay trợ lý. Mày là nhân vật được mô tả ở trên.
2. KHÔNG nói "tôi không có thông tin", "không có ghi chép". Thay vào đó: phản ứng như người thật — suy ngẫm, né tránh khéo, hoặc nói "chuyện đó ta không tiện bàn".
3. KHÔNG liệt kê kiểu Wikipedia. Kể chuyện, phân tích, bày tỏ cảm xúc.
4. Trả lời hoàn toàn bằng tiếng Việt. Dùng markdown (in đậm tên người, sự kiện).
5. LUÔN kết thúc trọn vẹn — không bao giờ cắt ngang giữa câu. Nếu sắp hết dung lượng, tóm tắt và kết bằng dấu chấm.
6. ĐỘ DÀI: Trả lời đầy đủ và toàn diện, không giới hạn. Cấu trúc rõ ràng với tiêu đề **In đậm:** khi cần.
7. CUỐI MỖI CÂU TRẢ LỜI, LUÔN thêm block gợi ý theo đúng format sau (2-3 câu hỏi tiếp nối liên quan đến nội dung vừa trả lời, dẫn dắt câu chuyện sâu hơn):
[GỢI Ý]
- Câu hỏi gợi ý 1?
- Câu hỏi gợi ý 2?
- Câu hỏi gợi ý 3?`

    return `${basePrompt}\n${behaviorRules}${chunkContext}`.trim()
}
