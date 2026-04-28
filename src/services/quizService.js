import { getEntity } from './retrieval'

export async function generateQuiz(entityId, count = 5) {
  const entity = getEntity(entityId)
  if (!entity) throw new Error('Entity not found')

  const chunksText = entity.chunks?.map((c, i) =>
    `[${i + 1}] ${c.content} (Nguồn: ${c.source})`
  ).join('\n') || ''

  const prompt = `Dựa trên thông tin sau về ${entity.name}, hãy tạo ${count} câu hỏi trắc nghiệm (MCQ) bằng tiếng Việt.

THÔNG TIN:
${chunksText}

YÊU CẦU:
- Mỗi câu hỏi có 4 đáp án (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Câu hỏi phải kiểm tra sự hiểu biết về sự kiện/chi tiết lịch sử
- Trả lời JSON array với format:
[
  {
    "question": "Câu hỏi",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct": 0,
    "explanation": "Giải thích đáp án đúng và nguồn [1]"
  }
]`

  return { entity, prompt }
}

export function calculateScore(answers, questions) {
  let correct = 0
  const results = answers.map((answer, i) => {
    const isCorrect = answer === questions[i].correct
    if (isCorrect) correct++
    return { ...questions[i], userAnswer: answer, isCorrect }
  })
  return { results, score: Math.round((correct / questions.length) * 100) }
}