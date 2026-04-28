# Ngữ cảnh Session Hiện Tại

## Đang làm tính năng
Bỏ chức năng Giáo viên, bỏ Auth/Firebase, công khai app cho tất cả mọi người

## Đã làm đến bước
Hoàn tất — đã xóa Teacher, Auth, Firebase. Build thành công, push code.

## Vấn đề đang gặp
(không có)

## Quyết định kỹ thuật đã chốt
- App công khai, không yêu cầu đăng nhập. Ai cũng dùng được.
- AI sử dụng Gemini 2.5 Flash API, gọi qua Netlify Functions (bảo vệ API key phía server).
- Không dùng Firebase (không auth, không database).
- SSE stream cần buffer để xử lý TCP chunks không trọn vẹn.

## File KHÔNG được thay đổi trong session này
- Thư mục `src/data/` (Nếu không có task liên quan đến entity)
- `netlify.toml`

## Ghi chú thêm
- Đã gỡ bỏ toàn bộ Firebase SDK và Auth hooks.
- Chỉ cần set biến `GEMINI_API_KEY` trên Netlify để app hoạt động.
