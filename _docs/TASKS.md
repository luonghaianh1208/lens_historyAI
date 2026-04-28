# Task Board

## 🔴 Đang làm
(để trống — điền khi bắt đầu session mới)

## 🟡 Cần làm tiếp
- [ ] Rà soát chức năng Quiz — kiểm tra xem `quizService.js` đã hoạt động thực tế và có giao diện (UI) tích hợp logic chấm điểm hoàn chỉnh hay chưa. — độ ưu tiên: cao
- [ ] Tích hợp tính năng Lưu DB (Firestore) — Cần đẩy kết quả quiz, lịch sử chat của user lên Firestore để lưu vết học tập (đặc biệt cho chức năng Teacher mode hoạt động). — độ ưu tiên: cao
- [ ] Mở rộng dữ liệu `entities` và `events` — Tạo thêm các đối tượng tương tác phong phú, hoặc công cụ chuyển từ Admin Panel thẳng lên Firestore (vượt qua JSON cứng). — độ ưu tiên: tb
- [ ] Xây dựng Routing và Page cho Teacher — Khởi tạo Dashboard ở `Teacher.jsx` để giáo viên xem kết quả học tập của học sinh qua dữ liệu Firebase. — độ ưu tiên: cao

## ✅ Đã hoàn thành
- [x] Tạo khung kiến trúc React app (Vite + Tailwind) — hoàn thành ngày 2026-04-28
- [x] Tích hợp Chatbot SSE logic (Gemini + Netlify Functions) — hoàn thành ngày 2026-04-28
- [x] Cấu trúc SSO Google Sign-In với Firebase — hoàn thành ngày 2026-04-28
- [x] Thiết lập repo và deploy init — hoàn thành ngày 2026-04-28
- [x] Đồng bộ tên module API `claudeApi.js` → `geminiApi.js` — hoàn thành ngày 2026-04-28
- [x] Fix SSE Stream buffer bug — hoàn thành ngày 2026-04-28
- [x] Thêm route và navigation cho Teacher page — hoàn thành ngày 2026-04-28
- [x] Gỡ dependency `@anthropic-ai/sdk` thừa — hoàn thành ngày 2026-04-28

## ❌ Đã bỏ / không làm nữa
- Sử dụng Claude / Anthropic API — Chuyển sang Gemini API từ Google tiết kiệm chi phí tích hợp hơn cho luồng chat dài.
