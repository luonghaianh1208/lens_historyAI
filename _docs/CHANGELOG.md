# Changelog

## [2026-04-28] - Fix bugs và đồng bộ codebase
### Đã sửa
- [BUG-001] Đổi tên `claudeApi.js` → `geminiApi.js`, sửa `.env.example` từ `ANTHROPIC_API_KEY` → `GEMINI_API_KEY`
- [BUG-002] SSE Stream parser thêm `sseBuffer` để xử lý TCP chunk không trọn vẹn, tránh mất chữ
- [BUG-003] Thêm route `/teacher` vào `App.jsx` để truy cập trang Giáo viên
- [BUG-004] Gỡ dependency `@anthropic-ai/sdk` không sử dụng khỏi `package.json`
### Đã thêm
- Nút "Giáo viên" trên header trang Home để điều hướng tới `/teacher`
### Đã xóa
- File `src/services/claudeApi.js` (thay bằng `geminiApi.js`)
- Dependency `@anthropic-ai/sdk`
### File bị ảnh hưởng
- `.env.example`
- `src/App.jsx`
- `src/hooks/useChat.js`
- `src/services/geminiApi.js` (mới)
- `src/services/claudeApi.js` (xóa)
- `src/pages/Home.jsx`
- `package.json`

---

## [2026-04-28] - Khởi tạo tài liệu dự án
### Trạng thái hiện tại
- **Core Modules**: Router, Firebase Auth (Google Sign-In), Netlify serverless functions đều hoạt động.
- **Entity View**: Hiển thị được nhân vật (Lê Lợi, Nguyễn Trãi, Trần Hưng Đạo) và sự kiện cơ bản từ mock data JSON.
- **Chatbot AI**: Tích hợp luồng Gemini 2.5 Flash thông qua Netlify API `chat.js` hỗ trợ Server-Sent Events (SSE).

### Hướng dẫn cập nhật
Sau mỗi session làm việc, thêm block mới theo format:

## [YYYY-MM-DD] - Tên tính năng / công việc
### Đã thêm
- ...
### Đã sửa
- ...
### Đã xóa
- ...
### File bị ảnh hưởng
- đường dẫn file 1
- đường dẫn file 2
