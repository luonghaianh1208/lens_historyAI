# Bug Tracker

## Hướng dẫn
Thêm bug mới theo format bên dưới.
Trạng thái: open | in-progress | fixed | wont-fix

---

## [BUG-001] Mâu thuẫn tên module và biến cấu hình LLM
- **Mô tả**: Tên file dịch vụ frontend gọi là `claudeApi.js` nhưng backend gọi Gemini. `.env.example` liệt kê `ANTHROPIC_API_KEY` nhưng backend cần `GEMINI_API_KEY`.
- **Tái hiện**:
  1. Dev clone project.
  2. Cấu hình `.env` theo `.env.example` → thiếu `GEMINI_API_KEY`.
- **Nguyên nhân**: Refactoring từ Claude sang Gemini nhưng quên đồng bộ tên file và biến.
- **Trạng thái**: fixed
- **File liên quan**: `src/services/claudeApi.js` → `src/services/geminiApi.js`, `.env.example`
- **Fix tại**: Session 2026-04-28 — Đổi tên file, cập nhật `.env.example`, gỡ `@anthropic-ai/sdk`

---

## [BUG-002] SSE Stream Parser thiếu buffer gây mất chữ
- **Mô tả**: Vòng lặp giải mã SSE chunk dùng `decoder.decode(value)` rồi cắt `'\n'` trực tiếp. Nếu TCP chunk bị chia giữa JSON object, `JSON.parse` sẽ fail và mất text.
- **Tái hiện**:
  1. Gửi câu hỏi cần AI trả lời dài.
  2. Một phần chữ có thể bị mất (không xuất hiện trên màn hình).
- **Nguyên nhân**: Thiếu buffer đệm cho SSE data chưa trọn vẹn.
- **Trạng thái**: fixed
- **File liên quan**: `src/hooks/useChat.js`
- **Fix tại**: Session 2026-04-28 — Thêm `sseBuffer` giữ lại dòng cuối chưa hoàn chỉnh

---

## [BUG-003] Trang Teacher không có route → không truy cập được
- **Mô tả**: `Teacher.jsx` đã tồn tại nhưng không có entry trong `App.jsx` Routes.
- **Tái hiện**:
  1. Truy cập `/teacher` → hiện trang trắng.
- **Nguyên nhân**: Quên thêm Route khi tạo page mới.
- **Trạng thái**: fixed
- **File liên quan**: `src/App.jsx`
- **Fix tại**: Session 2026-04-28 — Thêm `<Route path="/teacher" element={<Teacher />} />`

---

## [BUG-004] Dependency `@anthropic-ai/sdk` thừa trong package.json
- **Mô tả**: SDK Anthropic vẫn nằm trong dependencies dù không có file nào import. Tốn dung lượng node_modules và gây nhầm lẫn.
- **Trạng thái**: fixed
- **File liên quan**: `package.json`
- **Fix tại**: Session 2026-04-28 — `npm uninstall @anthropic-ai/sdk`
