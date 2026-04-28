# Changelog

## [2026-04-28] Session 2 — Fix Bugs + Phát triển
### Đã sửa
- BUG-005: maxTokens theo lengthLevel (short=800, medium=2000, long=3500) thay vì hardcode 1000
- BUG-007: Quiz reset toàn bộ state khi navigate sang entity khác
- BUG-008: Quiz review hiển thị từng option với highlight xanh/đỏ + icon ✓/✗
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
