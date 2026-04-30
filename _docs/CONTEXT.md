# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Session 5 — Refactor CSS + Lazy Loading + Doc update

## Đã làm đến bước
- Refactor `index.css`: xóa comment thừa, consolidated transitions, focus-visible, grid layouts
- Refactor `App.jsx`: React.lazy + Suspense cho code-splitting tự động
- Tách nền 7 ảnh nhân vật → transparent (rembg AI)
- Redesign Entity page: hero + scroll paper + wax seal
- Câu hỏi gợi ý Chat linh hoạt theo entity + perspective
- Cập nhật _docs đầy đủ

## Quyết định kỹ thuật đã chốt
- maxTokens theo lengthLevel: short=800, medium=2000, long=3500
- AI response dùng markdown formatting, frontend render qua ReactMarkdown
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo ưu tiên
- Quick suggestions context-aware theo entity type + perspective + persona
- TTS dùng `gemini-3.1-flash-tts-preview`, tone qua text prefix (không systemInstruction)
- Ảnh nhân vật: WebP transparent (tách nền bằng rembg), không dùng mix-blend-mode
- App công khai, không auth, biến môi trường duy nhất `GEMINI_API_KEY`
- Lazy loading cho tất cả page components → code-split tự động
- Texture overlay z-index: 0 (không chặn pointer events), opacity: 0.22
- Focus-visible outline: `rgba(184, 134, 11, 0.75)` cho accessibility

## File KHÔNG được thay đổi
- `netlify.toml`
- `netlify/functions/chat.js` (trừ khi đổi logic API)
