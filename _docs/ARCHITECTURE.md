# Kiến trúc Hệ Thống (Architecture)

## Tổng quan
- Ứng dụng công khai, không yêu cầu đăng nhập. Ai cũng có thể sử dụng.
- AI sử dụng: **Gemini 2.5 Flash** (qua Netlify Functions để bảo vệ API key).

## Mối Quan Hệ Giữa Các Module
- **Trang chủ (`Home.jsx`)**: Điểm bắt đầu, hiển thị danh sách các nhân vật và sự kiện lịch sử, tính năng tìm kiếm.
- **Trang Chi Tiết (`Entity.jsx`)**: Thông tin sơ lược của 1 nhân vật/sự kiện, điều hướng tới Quiz hoặc Chat.
- **Tính năng AI Chat (`Chat.jsx` & `useChat.js`)**:
  - Khởi tạo system prompt chuẩn form từ profile nhân vật tĩnh (`src/data/entities/*`).
  - Gọi Netlify Function `/chat` với SSE streaming.
- **Tính năng Trắc nghiệm (`Quiz.jsx` & `quizService.js`)**: Câu hỏi trắc nghiệm tĩnh, có chấm điểm.

## Custom Hooks
- **`useChat.js`**:
  - Đóng gói API Fetch stream + History memory quản lý hội thoại.
  - Input: `entityId` + góc nhìn (self/contemporary/historian) + độ dài câu trả lời.
  - Có SSE buffer để xử lý TCP chunks không trọn vẹn.
  - Fallback mock response khi chạy dev không có Netlify.

## Dữ liệu
- **Dữ liệu tĩnh**: Toàn bộ nội dung lịch sử đọc từ JSON trong `src/data/`. `retrieval.js` cung cấp getEntity/searchEntities.
- **Không dùng database**: Ứng dụng không kết nối database, không lưu trữ dữ liệu người dùng.

## Backend API
- `netlify/functions/chat.js`: Server-side proxy kết nối Gemini API (`gemini-2.5-flash`), giấu `GEMINI_API_KEY`.
