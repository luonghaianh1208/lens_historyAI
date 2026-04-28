# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Session 2 — Fix bugs + phát triển thêm tính năng và dữ liệu

## Đã làm đến bước
Hoàn tất toàn bộ 13 tasks. Build thành công, push code.

## Quyết định kỹ thuật đã chốt
- maxTokens theo lengthLevel: short=800, medium=2000, long=3500
- AI response dùng markdown formatting, frontend render qua ReactMarkdown
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo ưu tiên
- Quick suggestions sinh động từ entity data + perspective
- Tính năng Google Text-to-Speech tự động đọc nội dung AI Generate
- App công khai, không auth, chỉ cần GEMINI_API_KEY và GOOGLE_CLOUD_TTS_KEY

## File KHÔNG được thay đổi
- `netlify.toml`
- `netlify/functions/chat.js` (trừ khi đổi logic API)
