# HistoryLens AI — Claude Code System Prompt

---

## MỤC TIÊU

**HistoryLens AI** — webapp AI nhập vai nhân vật lịch sử Việt Nam.
Mục tiêu: **chạy được trên Netlify**, dùng cho thi Tin học trẻ.

---

## STACK

```
Frontend : React 19 + Vite + TailwindCSS v4
Hosting  : Netlify (deploy tự động qua GitHub)
AI API   : Gemini 2.5 Flash (server-side, key never exposed)
Data     : JSON tĩnh trong src/data/ (entities + events)
TTS      : Google Cloud TTS (vi-VN voices, per-character configs)
```

> KHÔNG Firebase, KHÔNG Teacher page, KHÔNG login.
> App công khai cho mọi người dùng.

---

## CẤU TRÚC THƯ MỤC

```
historylens-ai/
├── src/
│   ├── pages/           # Home, Entity, Chat, Quiz
│   ├── hooks/
│   │   ├── useChat.js   # Chat state + streaming
│   │   └── useTTS.js    # TTS playback (speak, stop, playing, loading, chunkInfo)
│   ├── services/
│   │   ├── geminiApi.js      # buildSystemPrompt() + API helpers
│   │   ├── retrieval.js      # getEntity(), searchEntities() from JSON
│   │   ├── quizService.js    # Quiz generation helpers
│   │   └── ttsService.js    # Voice configs per entity (VOICE_CONFIGS)
│   ├── data/
│   │   ├── entities/         # nguyen-trai.json, le-loi.json, tran-hung-dao.json
│   │   └── events/           # khoi-nghia-lam-son.json, chien-thang-bach-dang.json
│   └── index.css            # Tailwind imports only (@import "tailwindcss")
├── netlify/
│   └── functions/
│       ├── chat.js          # Gemini API proxy
│       └── tts.js           # Google Cloud TTS proxy
├── netlify.toml
├── package.json
└── CLAUDE.md
```

---

## DATA SCHEMA

### Entity (person)

```json
{
  "id": "nguyen-trai",
  "type": "person",
  "name": "Nguyễn Trãi",
  "period": "Hậu Lê sơ",
  "roles": ["Quân sư", "Nhà thơ"],
  "tags": ["quân sư", "nhà thơ"],
  "short_desc": "...",
  "timeline": [{ "year": 1380, "event": "..." }],
  "perspectives": {
    "self": { "persona": "Nguyễn Trãi tự thuật", "system_prompt": "..." },
    "contemporary": { "persona": "...", "system_prompt": "..." },
    "historian": { "persona": "...", "system_prompt": "..." }
  },
  "chunks": [{ "id": "nt-001", "content": "...", "source": "...", "reliability": 95 }]
}
```

### Event

Event perspectives dùng key bất kỳ (ví d: `le-loi`, `nguyen-trai`, `historian`).
Chat page đọc perspectives từ entity data — KHÔNG hardcode keys.

```json
{
  "id": "khoi-nghia-lam-son",
  "type": "event",
  "period": "1418-1427",
  "perspectives": {
    "le-loi": { "persona": "Lê Lợi — người lãnh đạo", "system_prompt": "..." },
    "nguyen-trai": { "persona": "Nguyễn Trãi — quân sư", "system_prompt": "..." },
    "historian": { "persona": "Sử gia hiện đại", "system_prompt": "..." }
  }
}
```

---

## LỆNH THƯỜNG DÙNG

```bash
npm run dev      # Local dev: http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## TEXT-TO-SPEECH (TTS)

### Voice Configurations (src/services/ttsService.js)

Mỗi nhân vật có voice riêng (Standard voices vi-VN):

| Entity | Voice | Đặc điểm |
|--------|-------|-----------|
| nguyen-trai | vi-VN-Standard-C | Giọng trầm ấm, văn chương (scholar tone) |
| le-loi | vi-VN-Standard-D | Giọng mạnh mẽ, quyết đoán (leader tone) |
| tran-hung-dao | vi-VN-Standard-B | Giọng oai vệ, uy nghiêm (military) |
| ly-thuong-kiet | vi-VN-Standard-A | Giọng rắn rỏi, tự tin |

Fallback: `vi-VN-Standard-A` cho nhân vật chưa config.

### useTTS Hook

```javascript
const { speak, stop, playing, loading, chunkInfo } = useTTS()
// speak(text, entityId) — phát audio từ text
// stop() — dừng audio đang phát
// playing — boolean, đang phát audio
// loading — boolean, đang tổng hợp giọng nói
// chunkInfo — { current, total } khi text bị chia nhỏ
```

### TTS Auto-play

Chat page tự động phát TTS khi có assistant message (nếu `autoPlayTTS=true`).
Text tự động clean markdown trước khi gửi: `replace(/[#*_`~\[\]]/g, '')`.

### Long Text Chunking

Nếu text > 200 chars, tự động chia thành chunks nhỏ để tránh timeout.
`chunkInfo` hiển thị tiến trình: "Đoạn 1/3..."

---

## NETLIFY FUNCTION

### `netlify/functions/chat.js`

- Netlify Functions v2 format: `export default async (req) => new Response(...)`
- Model: `gemini-2.5-flash`
- Streaming (SSE) và non-streaming đều hỗ trợ
- API key: `GEMINI_API_KEY` trong Netlify Environment Variables

### Build System Prompt

```javascript
// src/services/geminiApi.js
buildSystemPrompt(entity, perspective, lengthLevel)
// → Combines perspective config + length guide
// → No citation requirements
```

AI trả lời tự do dựa trên kiến thức model, KHÔNG bắt buộc dùng chunks.

---

## CẤU HÌNH DEPLOY

### `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 5173
```

### Environment Variables (Netlify Dashboard)

| Variable | Giá trị |
|---|---|
| `GEMINI_API_KEY` | Key từ aistudio.google.com |
| `GOOGLE_CLOUD_TTS_KEY` | Key từ Google Cloud Console → Text-to-Speech API |

---

## RÀNG BUỘC

1. **API key KHÔNG expose ra frontend** — phải qua Netlify Function
2. **Không vector DB** — tìm kiếm bằng keyword match trên JSON
3. **AI trả lời tự do** — không citation, dùng kiến thức model
4. **Mobile-friendly** — TailwindCSS responsive
5. **Guest mode** — không login, không Teacher page
6. **maxTokens theo lengthLevel**: short=800, medium=2000, long=3500
7. **AI response phải dùng markdown** — in đậm, đoạn văn rõ ràng
8. **Chat page phải render ReactMarkdown** cho assistant messages

---

## GHI CHÚ

- Search: `retrieval.js:searchEntities()` match theo name, aliases, tags, period
- Perspectives dynamic: Entity page đọc `Object.entries(entity.perspectives)` để render buttons
- Quiz: gọi Gemini tạo câu hỏi, fallback hardcoded nếu API lỗi
- Local dev: nếu `VITE_NETLIFY` không set, useChat sẽ trả mock response
- System prompt inject `entity.chunks[]` làm tài liệu tham khảo ưu tiên