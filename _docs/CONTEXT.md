# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Fix bugs toàn bộ codebase, đồng bộ hóa naming convention giữa frontend & backend

## Đã làm đến bước
Hoàn tất fix 4 bugs, build thành công, đã push lên GitHub

## Vấn đề đang gặp
(không có)

## Quyết định kỹ thuật đã chốt
- Hệ thống áp dụng Firebase Authentication (Dùng Google Auth Sign-In) cho toàn bộ user.
- Chat streaming xử lý thông qua Server-Sent Events (SSE) Netlify Functions.
- Ngôn ngữ mô hình LLM chính của hệ thống là Gemini 2.5 Flash, qua cổng Google APIs. Không dùng direct prompt client-side để bảo vệ API key.
- File service API đổi tên từ `claudeApi.js` → `geminiApi.js` cho nhất quán.
- SSE stream cần buffer (`sseBuffer`) để xử lý TCP chunks không trọn vẹn.

## File KHÔNG được thay đổi trong session này
- Thư mục `src/data/` (Nếu không có task liên quan đến entity)
- `netlify.toml` (Nếu không có sửa đổi routes)

## Ghi chú thêm
- Đã gỡ bỏ dependency `@anthropic-ai/sdk` khỏi project.
- Chú ý format payload SSE của Gemini trong serverless Netlify func, nó khác structure native của Claude hoặc OpenAI.
