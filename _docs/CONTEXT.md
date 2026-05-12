# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Session 8 — Bổ sung Võ Nguyên Giáp hoàn chỉnh

## Đã làm đến bước
- Thêm 9 preset Q&A cho `vo-nguyen-giap` (self, contemporary, historian × 3 câu)
- Generate 9 file TTS audio via `gemini-3.1-flash-tts-preview` (108/108 QA pass)
- Thêm voice config (Charon) + TTS style (Bắc Trung Bộ) cho Giáp
- Commit & push lên `main`
- Cập nhật CHANGELOG, TASKS

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
- Voice config cho Giáp: Charon (authoritative male, Bắc Trung Bộ accent)
- Tổng preset audio: 108 files (12 entities × 3 perspectives × 3 câu)

## File KHÔNG được thay đổi
- `netlify.toml`
- `netlify/functions/chat.js` (trừ khi đổi logic API)
