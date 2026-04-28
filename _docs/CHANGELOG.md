# Changelog

## [2026-04-28] Session 3 — Mở rộng dữ liệu ưu tiên cao
### Đã thêm
- Entity: **Nguyễn Huệ (Quang Trung)** (`nguyen-hue.json`)
- Entity: **Hồ Chí Minh** (`ho-chi-minh.json`)
- Event: **Trận Ngọc Hồi - Đống Đa** (`tran-dong-da.json`)
- Event: **Chiến thắng Điện Biên Phủ** (`dien-bien-phu.json`)
- Cấu hình TTS giọng đọc API Gemini cho các Entity (Puck, Charon, Fenrir) trong `ttsService.js`.
### File bị ảnh hưởng
- `src/services/retrieval.js` (Index data mới để hỗ trợ searchbox).
- `src/services/ttsService.js` (Thêm giọng đọc cấu hình).
- 4 file JSON mới trong `src/data/entities` và `src/data/events`.

---

## [2026-04-28] Session 2 — Fix Bugs + Phát triển
### Đã sửa
- BUG-005: maxTokens theo lengthLevel (short=800, medium=2000, long=3500) thay vì hardcode 1000
- BUG-007: Quiz reset toàn bộ state khi navigate sang entity khác
- BUG-008: Quiz review hiển thị từng option với highlight xanh/đỏ + icon ✓/✗
- BUG-009: Khắc phục lỗi voice đè nhau khi auto-play (Thêm AbortController API & ID Ref Tracking)
- BUG-010: Khắc phục lỗi giọng nói khó nghe và sai giới tính (Sử dụng prebuilt voice Gemini API format WAV)
### Đã thêm
- `react-markdown` — render markdown trong chat assistant messages
- Typing indicator 3 bouncing dots khi AI đang stream
- Quick suggestions động sinh từ entity data + perspective
- Nút "↓ Tin mới nhất" khi scroll lên trong chat
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo
- Related people resolve tên thật từ `getEntity()`
- Entity: **Lý Thường Kiệt** (`ly-thuong-kiet.json`) — 3 perspectives, 7 timeline, 5 chunks
- Event: **Chiến tranh Lý–Tống** (`chien-tranh-ly-tong.json`) — 3 perspectives, 6 timeline, 4 chunks
- Thêm 2 entity mới vào Home suggestions
- Tích hợp tính năng Text-to-Speech bằng API của Gemini (`gemini-3.1-flash-tts-preview`). Hỗ trợ đọc tự động nội dung AI. Đồng nhất sử dụng một biến môi trường `GEMINI_API_KEY`. Sửa lỗi mimeType format `audio/l16`.
### File bị ảnh hưởng
- `src/hooks/useChat.js`, `src/pages/Quiz.jsx`, `src/pages/Chat.jsx`
- `src/services/geminiApi.js`, `src/services/retrieval.js`
- `src/pages/Entity.jsx`, `src/pages/Home.jsx`
- `src/data/entities/ly-thuong-kiet.json` (NEW)
- `src/data/events/chien-tranh-ly-tong.json` (NEW)
- `package.json` (thêm react-markdown)

---

## [2026-04-28] — Bỏ Teacher/Auth/Firebase, công khai app
### Đã xóa
- Teacher.jsx, useAuth.js, firebase.js, dependency firebase

---

## [2026-04-28] — Fix bugs và đồng bộ codebase
### Đã sửa
- BUG-001–004: đổi tên claudeApi→geminiApi, SSE buffer, route Teacher, gỡ @anthropic-ai/sdk
