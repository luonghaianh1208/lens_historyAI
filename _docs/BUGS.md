# Bug Tracker

## Hướng dẫn
Thêm bug mới theo format bên dưới.
Trạng thái: open | in-progress | fixed | wont-fix

---

## [BUG-001] Mâu thuẫn tên module và biến cấu hình LLM
- **Trạng thái**: fixed — Session 2026-04-28

## [BUG-002] SSE Stream Parser thiếu buffer gây mất chữ
- **Trạng thái**: fixed — Session 2026-04-28

## [BUG-003] Trang Teacher không có route
- **Trạng thái**: fixed → removed (đã bỏ chức năng Teacher)

## [BUG-004] Dependency `@anthropic-ai/sdk` thừa
- **Trạng thái**: fixed — Session 2026-04-28

---

## [BUG-005] maxTokens hardcode 1000 — AI bị cụt giữa chừng
- **Mô tả**: `useChat.js` hardcode `maxTokens: 1000` cho mọi lengthLevel. Khi user chọn "Dài", AI trả lời bị ở khoảng 5-6 câu rồi dừng.
- **Nguyên nhân**: Không tính maxTokens theo lengthLevel.
- **Trạng thái**: fixed
- **Fix**: `maxTokens = { short: 800, medium: 2000, long: 3500 }[lengthLevel]`
- **File**: `src/hooks/useChat.js`

## [BUG-006] lengthLevel không reactive trong useCallback
- **Mô tả**: `sendMessage` dùng `useCallback` nhưng `lengthLevel` có thể thiếu trong dependency array.
- **Trạng thái**: fixed (đã có sẵn trong dependency array)
- **File**: `src/hooks/useChat.js`

## [BUG-007] Quiz không reset state khi đổi entity
- **Mô tả**: Navigate từ quiz entity A sang B, score/answers/currentQuestion giữ nguyên giá trị cũ.
- **Trạng thái**: fixed
- **Fix**: Thêm full state reset trong `useEffect([entityId])`
- **File**: `src/pages/Quiz.jsx`

## [BUG-008] Quiz review không highlight đáp án sai/đúng
- **Mô tả**: Phần review chỉ hiện text "Đáp án đúng: X", không có visual rõ ràng.
- **Trạng thái**: fixed
- **Fix**: Render từng option với nền xanh (đúng) / đỏ (sai) + icon ✓/✗
- **File**: `src/pages/Quiz.jsx`
