# HistoryLens AI - Developer Context & Architecture Guide

## 📌 Project Overview
**HistoryLens AI** là một ứng dụng web giáo dục lịch sử Việt Nam, cho phép người dùng tìm hiểu lịch sử thông qua hồ sơ nhân vật/sự kiện, trò chuyện nhập vai với AI đa góc nhìn (Multi-perspective AI Chat), và ôn tập bằng các bài Quiz động.

**Mục tiêu thiết kế (Vibe):** "Cuộn thư cổ mở ra giữa cảnh quan lịch sử" – Giao diện mang đậm chất Á Đông, sang trọng, chiều sâu không gian (depth), màu sắc cổ kính, tạo cảm giác nhập vai (immersive).

## 🛠 Tech Stack
- **Frontend:** React 19, Vite (v8), Tailwind CSS (kết hợp với Vanilla CSS để quản lý CSS variables & animation).
- **Routing:** React Router v6.
- **Backend / Serverless:** Netlify Functions (`netlify/functions/chat.js`).
- **AI / LLM:** Google Gemini 2.5 Flash API.
- **Font chữ:** `Playfair Display` (Serif/Display - hỗ trợ tiếng Việt hoàn chỉnh), `Be Vietnam Pro` (Sans-serif).

## 📂 Codebase Structure & Key Files

### 1. Dữ liệu & Chuẩn hóa (Retrieval & Data Layer)
- **Data files:** `src/data/entities/*.json` và `src/data/events/*.json`. Chứa thông tin về nhân vật, sự kiện, timeline, và các `chunks` (trích đoạn sử liệu phục vụ RAG).
- **`src/services/retrieval.js`:** Trái tim của việc lấy dữ liệu.
  - Cung cấp hàm `normalizeEntity()` để tự động điền các trường mặc định (fallback) cho entity.
  - Chứa thuật toán `repairMojibakeText()` để tự động sửa lỗi font UTF-8 (mojibake) từ file JSON.
  - Sinh index động (`getIndex`) cho trang chủ và thanh tìm kiếm.

### 2. Quản lý Tài nguyên (Assets Layer)
- **`src/services/assetService.js`:** Quản lý hình ảnh nền và nhân vật.
  - Sử dụng `ENTITY_CHARACTER_PATHS` để map sự kiện/nhân vật với ảnh đại diện mặc định.
  - Sử dụng `PERSPECTIVE_CHARACTER_PATHS` và `getPerspectiveCharacterUrl()` để render ảnh nhân vật thay đổi linh hoạt theo **góc nhìn (perspective)** trong Chat (VD: Trận Điện Biên Phủ + phe Pháp -> Ảnh Tướng De Castries).

### 3. Giao diện chính (Pages)
- **`Home.jsx`:** Trang chủ, thanh tìm kiếm, danh sách nhân vật nổi bật.
- **`Entity.jsx`:** Trang chi tiết (Hồ sơ). Hiển thị bối cảnh (background), nhân vật đứng trên sàn (character-stage), tổng quan, niên biểu (timeline), và nguồn tài liệu (sources).
- **`Chat.jsx`:** Giao diện trò chuyện AI.
  - Tích hợp `suggestionCatalog` chứa các câu hỏi mồi (prompts) tĩnh, cực kỳ linh hoạt tùy thuộc vào entity và perspective.
  - Quản lý scroll tự động thông minh bằng `isPinnedToBottom`.
  - Sử dụng `React.memo` cho `MessageBubble` để tối ưu hiệu năng.
- **`Quiz.jsx`:** Giao diện tạo và làm bài tập trắc nghiệm dựa trên nội dung entity.

### 4. Custom Hooks & Trạng thái
- **`useChat.js`:** Quản lý state của tin nhắn, lịch sử chat, gọi API đến Netlify Function `/api/chat`.
- **`useTTS.js`:** Text-to-Speech (Đọc văn bản) tự động tách câu dài thành các chunk nhỏ để phát âm thanh mà không bị ngắt quãng.
- **`useLocalStorage.js`:** Quản lý lưu trữ cục bộ.
- **`useKeyboardShortcut.js`:** Quản lý phím tắt (VD: Ctrl+K để mở Search).

## 🧩 Architectural Patterns & Conventions

### 1. Multi-Perspective System (Hệ thống Đa góc nhìn)
Mỗi sự kiện hoặc nhân vật có thể được kể qua nhiều lăng kính khác nhau:
- **Nhân vật (`type: 'person'`):** Thường có `self` (tự thuật), `contemporary` (người cùng thời / quần chúng), `historian` (sử gia hiện đại).
- **Sự kiện (`type: 'event'`):** Thường có góc nhìn của các phe đối lập (VD: `viet-minh` vs `french`, `nguyen-hue` vs `tong-doc-hu-binh`) và `historian`.
*(Giao diện và ảnh nhân vật sẽ tự động thay đổi theo perspective đang chọn).*

### 2. RAG & System Prompt
Trong `netlify/functions/chat.js`:
- Backend nhận `entityId`, `perspective`, `lengthLevel`, và lịch sử `messages`.
- Backend tự động đọc dữ liệu JSON của entity đó, trích xuất thông tin nhân vật, config của perspective, và toàn bộ `chunks` (sử liệu) để chèn vào `system_prompt` gửi cho Gemini. LLM không bao giờ phải "bịa" thông tin vì đã có sẵn chunk sử liệu ép buộc.

### 3. Design System & CSS (Vibe Coding)
- **CSS Variables:** Quản lý màu sắc tập trung tại `src/index.css`.
  - Màu nền giấy: `--clr-paper`, `--clr-paper-dark`
  - Màu mực/văn bản: `--clr-ink`, `--clr-ink-soft`
  - Màu nhấn (Accent): `--clr-vermillion` (đỏ chu sa), `--clr-gold` (vàng kim), `--clr-jade` (ngọc bích).
- **Blend Mode:** Các file ảnh nhân vật (PNG/WEBP có nền sáng/trắng) được CSS xử lý thông qua class `.character-blend` (`mix-blend-mode: multiply` hoặc `darken`) để hòa trộn một cách mượt mà vào phong cảnh đằng sau, loại bỏ cảm giác "ảnh cắt dán".
- **Glassmorphism:** Các panel, header sử dụng class `.glass-panel` với `backdrop-filter: blur()`.

## 🚀 Các tập lệnh (Scripts)
- Phát triển: `npm run dev`
- Build production: `npm run build`
- Khởi chạy Netlify Functions cục bộ: `netlify dev` (nếu có cài netlify-cli)

## 📌 Các lưu ý quan trọng cho phiên làm việc sau
1. **Không sửa Font bừa bãi:** Không sử dụng font `Cinzel` vì font này KHÔNG hỗ trợ dấu Tiếng Việt, dẫn đến vỡ chữ. Luôn dùng `Playfair Display` cho tiêu đề và thẻ `.display`.
2. **Không tự gọi trực tiếp API Gemini ở Frontend:** Toàn bộ logic LLM phải đi qua thư mục `netlify/functions` để bảo mật API Key.
3. **Mỗi khi thêm Event mới:** Phải cập nhật `ENTITY_CHARACTER_PATHS` trong `assetService.js` để trỏ event đó tới nhân vật chính đại diện (nếu không nó sẽ render ảnh default).
4. **Luôn sử dụng `normalizeEntity()`:** Khi đọc entity từ cục bộ hay data, hãy luôn dùng dữ liệu đã đi qua hàm chuẩn hóa này để tránh lỗi properties `undefined`.