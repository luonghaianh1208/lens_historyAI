# Changelog

## [2026-04-28] - Bỏ chức năng Giáo viên & Auth, công khai app
### Đã xóa
- Trang `Teacher.jsx` và route `/teacher`
- Hook `useAuth.js` (không cần đăng nhập)
- File `firebase.js` (không dùng Firebase nữa)
- Dependency `firebase` khỏi `package.json`
- Nút "Giáo viên" trên header trang Home
- Các biến Firebase khỏi `.env.example`
### Đã sửa
- `.env.example` chỉ còn `GEMINI_API_KEY`
- Cập nhật toàn bộ `_docs/` phản ánh kiến trúc mới
### File bị ảnh hưởng
- `src/App.jsx`
- `src/pages/Home.jsx`
- `src/pages/Teacher.jsx` (xóa)
- `src/hooks/useAuth.js` (xóa)
- `src/services/firebase.js` (xóa)
- `.env.example`
- `package.json`

---

## [2026-04-28] - Fix bugs và đồng bộ codebase
### Đã sửa
- [BUG-001] Đổi tên `claudeApi.js` → `geminiApi.js`, sửa `.env.example` từ `ANTHROPIC_API_KEY` → `GEMINI_API_KEY`
- [BUG-002] SSE Stream parser thêm `sseBuffer` để xử lý TCP chunk không trọn vẹn
- [BUG-003] Thêm route `/teacher` vào `App.jsx`
- [BUG-004] Gỡ dependency `@anthropic-ai/sdk`
### Đã thêm
- Nút "Giáo viên" trên header trang Home
### Đã xóa
- File `src/services/claudeApi.js`
- Dependency `@anthropic-ai/sdk`

---

## [2026-04-28] - Khởi tạo tài liệu dự án
### Trạng thái hiện tại
- **Core Modules**: Router, Netlify serverless functions hoạt động.
- **Entity View**: Hiển thị nhân vật và sự kiện từ mock data JSON.
- **Chatbot AI**: Tích hợp Gemini 2.5 Flash qua Netlify API với SSE.

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
