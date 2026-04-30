# Kiến trúc Hệ Thống (Architecture)

## Tổng quan
- Ứng dụng công khai, không yêu cầu đăng nhập.
- AI: **Gemini 2.5 Flash** (Netlify Functions). TTS: **gemini-3.1-flash-tts-preview**.
- UI: Phong cách **Cổ phong Á Đông** — giấy cũ, mực tàu, hoa văn trống đồng.

## Modules
- **Home.jsx**: Trang chủ, tìm kiếm, danh sách entity.
- **Entity.jsx**: Hero toàn màn hình (cảnh nền + nhân vật transparent), cuộn thư cổ, tabs, nút wax-seal.
- **Chat.jsx + useChat.js**: SSE streaming, câu hỏi gợi ý context-aware, sidebar nhân vật vignette.
- **Quiz.jsx + quizService.js**: Trắc nghiệm tĩnh, chấm điểm.
- **AnimatedBackground.jsx**: 4 lớp CSS animation (bụi, hoa, mây, trống đồng).

## Custom Hooks
- **useChat.js**: API Fetch stream + History + SSE buffer + fallback mock.
- **useTTS.js**: Audio playback, AbortController, chunk tracking.

## Services
- **assetService.js**: URL ảnh nền/nhân vật, fallback default.
- **ttsService.js**: Map entity → voice name, gọi TTS API.
- **retrieval.js**: Index/search entity từ JSON tĩnh.

## Assets
- Nhân vật: `public/assets/characters/` — WebP transparent (tách nền rembg).
- Cảnh nền: `public/assets/backgrounds/` — WebP 1920x1080.
- Backup gốc: `characters/_backup_originals/`.

## Backend
- `netlify/functions/chat.js`: Proxy Gemini 2.5 Flash, SSE.
- `netlify/functions/tts.js`: Proxy TTS, WAV base64. Tone qua text prefix (không systemInstruction).
