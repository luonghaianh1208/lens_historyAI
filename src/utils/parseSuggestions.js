/**
 * Tách block [GỢI Ý] ra khỏi nội dung AI response.
 * Trả về { content, suggestions }.
 *  - content: nội dung chính (đã bỏ block gợi ý)
 *  - suggestions: mảng string các câu hỏi gợi ý
 */
export function parseSuggestions(text) {
  if (!text) return { content: '', suggestions: [] }

  // Tìm block [GỢI Ý] — có thể nằm ở cuối response
  const markerRegex = /\[GỢI Ý\]\s*\n?([\s\S]*?)$/i
  const match = text.match(markerRegex)

  if (!match) return { content: text.trim(), suggestions: [] }

  const content = text.slice(0, match.index).trim()
  const suggestionsBlock = match[1]

  // Parse từng dòng bắt đầu bằng "- "
  const suggestions = suggestionsBlock
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean)

  return { content, suggestions }
}
