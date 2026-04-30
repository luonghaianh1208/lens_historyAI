# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Session 5 — Context-aware suggestions + Doc update

## Đã làm đến bước
- Tách nền 7 ảnh nhân vật → transparent thực sự (rembg AI)
- Redesign Entity page: hero + scroll paper + wax seal
- Hệ thống hoạt ảnh nền 4 lớp CSS
- Fix TTS lỗi 400 (systemInstruction)
- Câu hỏi gợi ý Chat linh hoạt theo entity + perspective
- Cập nhật _docs (CHANGELOG, TASKS, BUGS, ARCHITECTURE, CONTEXT, PROJECT)

## Quyết định kỹ thuật đã chốt
- maxTokens theo lengthLevel: short=800, medium=2000, long=3500
- AI response dùng markdown formatting, frontend render qua ReactMarkdown
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo ưu tiên
- Quick suggestions context-aware theo entity type + perspective + persona
- TTS dùng `gemini-3.1-flash-tts-preview`, tone qua text prefix (không systemInstruction)
- Ảnh nhân vật: WebP transparent (tách nền bằng rembg), không dùng mix-blend-mode
- App công khai, không auth, biến môi trường duy nhất `GEMINI_API_KEY`

## File KHÔNG được thay đổi
- `netlify.toml`
- `netlify/functions/chat.js` (trừ khi đổi logic API)
