# Changelog

## [2026-04-30] Session 5d — Perspective-aware Character Avatars
### Đã thêm
- 8 ảnh nhân vật phụ (perspective characters): De Castries, Võ Nguyên Giáp, Tôn Sĩ Nghị, Tướng nhà Tống, Quân sĩ nhà Trần, Ngô Thì Nhậm, Người dân VN, Sử gia hiện đại
- `getPerspectiveCharacterUrl()` trong assetService.js — sidebar Chat đổi ảnh theo perspective
- `ENTITY_CHARACTER_PATHS` + `PERSPECTIVE_CHARACTER_PATHS` lookup maps
### Đã sửa
- Chat sidebar giờ hiện đúng nhân vật theo góc nhìn (VD: Điện Biên Phủ + "Pháp" → De Castries)
### File bị ảnh hưởng
- `src/services/assetService.js` (refactor + thêm perspective lookup)
- `src/pages/Chat.jsx` (đổi import → `getPerspectiveCharacterUrl`)
- `public/assets/characters/` (8 ảnh PNG mới)

---

## [2026-04-30] Session 5c — Hand-crafted Suggestion Catalog
### Đã thêm
- `suggestionCatalog` trong Chat.jsx: ~33 bộ câu hỏi viết tay riêng cho 11 entity × 3 perspectives
- Logic nhận diện "phe thua" (De Castries, Tôn Sĩ Nghị, Tướng nhà Tống...) → câu hỏi phù hợp góc nhìn thất bại
- Fallback thông minh: nếu entity/perspective không có trong catalog → dùng template động
### File bị ảnh hưởng
- `src/pages/Chat.jsx` (thêm ~190 dòng suggestion data + defeated-side logic)

---

## [2026-04-30] Session 5b — CSS Refactor + Lazy Loading
### Đã cải thiện
- **Code-splitting**: `App.jsx` dùng `React.lazy` + `Suspense` cho tất cả pages → mỗi page là chunk JS riêng
- **CSS cleanup**: Xóa toàn bộ comment thừa, format spacing nhất quán
- **Accessibility**: Thêm `focus-visible` outline vàng đồng cho tất cả interactive elements
- **Consolidated transitions**: Gom transition rules cho 10+ button/interactive class vào 1 block
- **Grid layouts**: Thêm `.chat-layout`, `.hero-summary-grid`, `.home-journey-grid` cho responsive grid
- **Texture overlay**: z-index 9999→0, opacity 0.4→0.22 (nhẹ nhàng hơn, không chặn interactions)
- **Thêm utilities**: `.page-shell`, `.interactive-surface`, `.glass-panel`, `.section-kicker`, `.dongson-bg-quiet`
- **Xóa unused**: `.bg-scene`, `.content-slide-in`
- **Reduced motion**: Mở rộng danh sách animation bị disable (thêm `.title-glow`, `.animate-in`, `.animate-ink`)
### File bị ảnh hưởng
- `src/App.jsx` (lazy loading + Suspense fallback)
- `src/index.css` (refactor toàn bộ ~680 dòng)

---

## [2026-04-30] Session 5 — Context-aware Chat Suggestions
### Đã sửa
- Câu hỏi gợi ý trong Chat giờ linh hoạt theo từng entity + perspective
- Không còn hỏi nhân vật về chính mình ở ngôi thứ 3 (ví dụ: "Lý Thường Kiệt là người thế nào trong mắt ngài?" khi đang là Quan lại triều Lý)
- Hồ Chí Minh + "Người dân VN": câu hỏi phù hợp ngữ cảnh dân gian
- Sự kiện: câu hỏi khớp persona cụ thể (Võ Nguyên Giáp, De Castries...)
### File bị ảnh hưởng
- `src/pages/Chat.jsx` (hàm `getQuickSuggestions` viết lại hoàn toàn)

---

## [2026-04-30] Session 4 — Immersive UI Redesign + Tách nền ảnh nhân vật
### Đã thêm
- **Hệ thống hoạt ảnh nền** (`AnimatedBackground.jsx`): 4 lớp CSS — hạt bụi vàng, cánh hoa rơi, mây trôi, hoa văn trống đồng pulse
- **Entity Page redesign**: Hero section toàn màn hình với cảnh nền + nhân vật đứng giữa, cuộn thư cổ animation, khung viền cổ điển + họa tiết góc
- **CSS Design Tokens**: `--clr-paper`, `--clr-vermillion`, `--clr-gold`, `--clr-jade`, `--clr-ink` cho phong cách Cổ phong Á Đông
- **Nút wax-seal**: `.btn-seal` (đỏ son) và `.btn-seal-ghost` (viền vàng)
- **Title glow animation**: tên nhân vật phát sáng nhẹ
- **Tách nền ảnh nhân vật**: Dùng rembg (U2-Net AI) tách trắng → transparent cho 7 ảnh character
- **Ảnh nền bối cảnh**: 6 ảnh `bg_*.webp` cho các nhân vật/sự kiện
- **Ảnh nhân vật**: 7 ảnh `char_*.webp` phong cách tranh Á Đông
### Đã sửa
- BUG-011: TTS lỗi 400 do `systemInstruction` không hỗ trợ bởi `gemini-3.1-flash-tts-preview`
- Xóa `mix-blend-mode: multiply` sau khi ảnh đã transparent thực sự
- Fix nhân vật bị crop mất đầu trên Entity page
- Card content nền trắng → giấy ố vàng
### File bị ảnh hưởng
- `src/index.css` (thêm ~200 dòng CSS mới: animation, scroll paper, blend mode, seal buttons)
- `src/pages/Entity.jsx` (viết lại hoàn toàn)
- `src/pages/Chat.jsx` (sidebar character upgrade)
- `src/pages/Home.jsx` (tích hợp design tokens + animated background)
- `src/components/AnimatedBackground.jsx` (NEW)
- `src/services/assetService.js` (NEW — quản lý URL ảnh nền + nhân vật)
- `netlify/functions/tts.js` (fix systemInstruction → text prefix)
- `public/assets/characters/*.webp` (7 ảnh đã tách nền)
- `public/assets/backgrounds/*.webp` (6 ảnh nền bối cảnh)

---

## [2026-04-28] Session 3 — Mở rộng dữ liệu ưu tiên cao
### Đã thêm
- Entity: **Nguyễn Huệ (Quang Trung)** (`nguyen-hue.json`)
- Entity: **Hồ Chí Minh** (`ho-chi-minh.json`)
- Event: **Trận Ngọc Hồi - Đống Đa** (`tran-dong-da.json`)
- Event: **Chiến thắng Điện Biên Phủ** (`dien-bien-phu.json`)
- Cấu hình TTS giọng đọc API Gemini cho các Entity (Puck, Charon, Fenrir) trong `ttsService.js`.
### File bị ảnh hưởng
- `src/services/retrieval.js` (Index data mới để hỗ trợ searchbox).
- `src/services/ttsService.js` (Thêm giọng đọc cấu hình).
- 4 file JSON mới trong `src/data/entities` và `src/data/events`.

---

## [2026-04-28] Session 2 — Fix Bugs + Phát triển
### Đã sửa
- BUG-005: maxTokens theo lengthLevel (short=800, medium=2000, long=3500) thay vì hardcode 1000
- BUG-007: Quiz reset toàn bộ state khi navigate sang entity khác
- BUG-008: Quiz review hiển thị từng option với highlight xanh/đỏ + icon ✓/✗
- BUG-009: Khắc phục lỗi voice đè nhau khi auto-play (Thêm AbortController API & ID Ref Tracking)
- BUG-010: Khắc phục lỗi giọng nói khó nghe và sai giới tính (Sử dụng prebuilt voice Gemini API format WAV)
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
- Tích hợp tính năng Text-to-Speech bằng API của Gemini (`gemini-3.1-flash-tts-preview`). Hỗ trợ đọc tự động nội dung AI. Đồng nhất sử dụng một biến môi trường `GEMINI_API_KEY`. Sửa lỗi mimeType format `audio/l16`.
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
