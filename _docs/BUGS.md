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

---

## [BUG-009] Lỗi âm thanh đè nhau (Overlapping Audio) trong Auto-play TTS
- **Mô tả**: Khi người dùng bật tự động đọc âm thanh, voice bị loop lặp liên hồi và đọc đè lên nhau.
- **Nguyên nhân**: `useEffect` phụ thuộc vào nhiều state thay đổi liên tục, và fetch không bị huỷ kịp => sinh ra array audio chồng chéo.
- **Trạng thái**: fixed
- **Fix**: Áp dụng tracking `Ref` cho tin nhắn cuối cùng phát ra, kết hợp với AbortController API để huỷ fetch TTS.
- **File**: `src/pages/Chat.jsx`, `src/hooks/useTTS.js`

## [BUG-010] Giọng Google Cloud TTS bị sai giới tính và thô
- **Mô tả**: Đọc âm thanh Nguyễn Trãi bị lỗi giới tính Nữ, giọng Google Cloud TTS không tự nhiên.
- **Trạng thái**: fixed
- **Fix**: Chuyển API hoàn toàn sang `gemini-3.1-flash-tts-preview` Audio Modality. Xử lý mimeType `audio/l16` thay vì `audio/pcm` và parse PCM base64 sang `.WAV`. Thay map voice thành Charon/Fenrir/Puck.
- **File**: `netlify/functions/tts.js`, `src/services/ttsService.js`, `src/hooks/useTTS.js`

## [BUG-011] TTS lỗi 400 — systemInstruction không hỗ trợ
- **Mô tả**: Model `gemini-3.1-flash-tts-preview` trả lỗi 400: "Developer instruction is not enabled for this model" khi payload chứa `systemInstruction`.
- **Nguyên nhân**: Model TTS không hỗ trợ `systemInstruction`, chỉ nhận `contents`.
- **Trạng thái**: fixed — Session 2026-04-29
- **Fix**: Xóa `systemInstruction`, đưa hướng dẫn tone/giọng trực tiếp vào text prefix trong `contents`.
- **File**: `netlify/functions/tts.js`

## [BUG-012] Ảnh nhân vật có nền trắng vuông — không hòa vào cảnh
- **Mô tả**: Ảnh AI-generated có nền trắng, dùng CSS `object-fit` không thể bỏ nền. `mix-blend-mode: multiply` chỉ là workaround làm tối ảnh.
- **Trạng thái**: fixed — Session 2026-04-30
- **Fix**: Dùng `rembg` (U2-Net AI model) tách nền trắng → WebP transparent thực sự cho 7 ảnh. Xóa `mix-blend-mode: multiply` khỏi CSS.
- **File**: `public/assets/characters/*.webp`, `src/index.css`

## [BUG-013] Câu hỏi gợi ý Chat không phù hợp ngữ cảnh
- **Mô tả**: Khi chọn perspective "Quan lại triều Lý" cho Lý Thường Kiệt, câu hỏi gợi ý hiện "Lý Thường Kiệt là người như thế nào trong mắt ngài?" — vô nghĩa vì LTK CHÍNH LÀ nhân vật đang được hỏi. Tương tự, HCM + "Người dân VN" cũng không phù hợp.
- **Trạng thái**: fixed — Session 2026-04-30
- **Fix**: Viết lại `getQuickSuggestions()` phân nhánh theo: entity type (person/event), perspective key (self/contemporary/historian/custom), persona name, và entityId đặc biệt (ho-chi-minh).
- **File**: `src/pages/Chat.jsx`
