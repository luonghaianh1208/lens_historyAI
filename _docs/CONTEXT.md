# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Session 3 — Mở rộng tập dữ liệu với 4 entities/events ưu tiên cao

## Đã làm đến bước
Hoàn tất cập nhật bộ 4 file Dữ liệu JSON `(nguyen-hue, ho-chi-minh, tran-dong-da, dien-bien-phu)`. Đã chèn thành công index và gán giọng đọc. Đã build test thành công. Sẵn sàng review.

## Quyết định kỹ thuật đã chốt
- maxTokens theo lengthLevel: short=800, medium=2000, long=3500
- AI response dùng markdown formatting, frontend render qua ReactMarkdown
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo ưu tiên
- Quick suggestions sinh động từ entity data + perspective
- Tính năng Text-to-Speech tự động đọc nội dung AI Generate đã được tích hợp dựa trên audio modality của **gemini-3.1-flash-tts-preview**. Định dạng raw audio/l16 sẽ được build sang WAV header tại serverless config của Netlify.
- App công khai, không auth, sử dụng chung biến môi trường API duy nhất `GEMINI_API_KEY`.

## File KHÔNG được thay đổi
- `netlify.toml`
- `netlify/functions/chat.js` (trừ khi đổi logic API)
