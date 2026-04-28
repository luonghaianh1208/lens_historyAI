# HistoryLens AI — Claude Code System Prompt
 
> Copy toàn bộ file này vào CLAUDE.md ở root project trước khi chạy Claude Code.
> Sau đó gõ lệnh đầu tiên ở phần cuối file.
 
---
 
## 🎯 MỤC TIÊU
 
Xây dựng **HistoryLens AI** — webapp AI nhập vai nhân vật lịch sử Việt Nam.
Mục tiêu: **chạy được trên Netlify trong 1–2 tuần**, dùng để thi Tin học trẻ.
 
---
 
## 🏗️ STACK BẮT BUỘC
 
```
Frontend : React + Vite + TailwindCSS
Hosting  : Netlify (deploy tự động qua GitHub)
Auth     : Firebase Authentication (Google OAuth)
Database : Firebase Firestore
AI API   : Anthropic Claude API (claude-sonnet-4-20250514)
Storage  : Firebase Storage (cho file MD/JSON dữ liệu)
Vector   : KHÔNG dùng vector DB — dùng keyword search + full-text trên Firestore
```
 
> KHÔNG dùng Next.js, KHÔNG dùng Supabase, KHÔNG dùng Qdrant.
> Giữ stack tối giản để deploy nhanh lên Netlify.
 
---
 
## 📁 CẤU TRÚC THƯ MỤC
 
```
historylens-ai/
├── public/
├── src/
│   ├── components/
│   │   ├── Search.jsx
│   │   ├── EntityPage.jsx
│   │   ├── ChatPanel.jsx
│   │   ├── Timeline.jsx
│   │   ├── QuizPanel.jsx
│   │   └── TeacherDashboard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Entity.jsx
│   │   ├── Chat.jsx
│   │   ├── Quiz.jsx
│   │   └── Teacher.jsx
│   ├── services/
│   │   ├── firebase.js       ← config Firebase
│   │   ├── claudeApi.js      ← gọi Anthropic API
│   │   ├── retrieval.js      ← tìm kiếm trong data JSON
│   │   └── quizService.js
│   ├── data/
│   │   ├── entities/         ← file JSON mỗi nhân vật/sự kiện
│   │   │   ├── nguyen-trai.json
│   │   │   ├── le-loi.json
│   │   │   └── ...
│   │   ├── events/
│   │   │   ├── khoi-nghia-lam-son.json
│   │   │   └── ...
│   │   └── index.json        ← danh sách tất cả entities để search
│   ├── hooks/
│   │   ├── useChat.js
│   │   └── useAuth.js
│   ├── App.jsx
│   └── main.jsx
├── netlify.toml
├── .env.example
├── package.json
└── CLAUDE.md
```
 
---
 
## 📐 DATA SCHEMA (JSON)
 
### Entity file — `src/data/entities/nguyen-trai.json`
 
```json
{
  "id": "nguyen-trai",
  "type": "person",
  "name": "Nguyễn Trãi",
  "aliases": ["Ức Trai", "Nguyễn Phi Khanh chi tử"],
  "born": 1380,
  "died": 1442,
  "period": "Hậu Lê sơ",
  "roles": ["Quân sư", "Nhà thơ", "Chính trị gia"],
  "short_desc": "Quân sư của Lê Lợi, tác giả Bình Ngô Đại Cáo, một trong những nhân vật vĩ đại nhất lịch sử Việt Nam.",
  "related_events": ["khoi-nghia-lam-son", "binh-ngo-dai-cao"],
  "related_people": ["le-loi", "le-thai-to"],
  "timeline": [
    { "year": 1380, "event": "Sinh tại làng Nhị Khê, Thường Tín" },
    { "year": 1400, "event": "Đỗ Thái học sinh dưới triều Hồ" },
    { "year": 1407, "event": "Bị giặc Minh bắt cha, thề rửa hận" },
    { "year": 1417, "event": "Tìm gặp Lê Lợi, tham gia khởi nghĩa Lam Sơn" },
    { "year": 1428, "event": "Soạn Bình Ngô Đại Cáo tuyên bố độc lập" },
    { "year": 1442, "event": "Bị hãm oan vụ Lệ Chi Viên, bị tru di tam tộc" }
  ],
  "perspectives": {
    "self": {
      "persona": "Nguyễn Trãi tự thuật",
      "voice": "Xưng 'ta', giọng văn chương, có bi kịch cá nhân",
      "system_prompt": "Mày là Nguyễn Trãi (1380–1442), quân sư của Lê Lợi. Hãy trả lời theo góc nhìn của chính mày — xưng 'ta', dùng văn phong cổ điển nhưng vẫn hiểu được. Bám sát sự thật lịch sử từ nguồn được cung cấp. Mọi khẳng định phải có căn cứ. Nếu không chắc, nói rõ đây là suy đoán."
    },
    "contemporary": {
      "persona": "Nhân vật cùng thời (Lê Lợi / tướng lĩnh)",
      "voice": "Nhìn Nguyễn Trãi từ bên ngoài, đánh giá vai trò",
      "system_prompt": "Mày là một tướng lĩnh/quan lại dưới trướng Lê Lợi, quan sát Nguyễn Trãi. Mô tả ông từ góc nhìn người cùng thời — đánh giá khách quan, có thể có mâu thuẫn hoặc kính trọng."
    },
    "historian": {
      "persona": "Sử gia hiện đại",
      "voice": "Trung tính, học thuật, so sánh nhiều nguồn",
      "system_prompt": "Mày là một sử gia Việt Nam hiện đại. Phân tích vai trò của Nguyễn Trãi dựa trên sử liệu, trích dẫn nguồn rõ ràng, phân biệt sự kiện đã xác nhận và diễn giải học thuật. Giọng trung tính, học thuật."
    }
  },
  "chunks": [
    {
      "id": "nt-001",
      "content": "Nguyễn Trãi sinh năm 1380 tại làng Nhị Khê. Cha là Nguyễn Phi Khanh, một học giả nổi tiếng. Ông đỗ Thái học sinh năm 1400 dưới triều Hồ Quý Ly.",
      "source": "Đại Việt sử ký toàn thư, Quyển X",
      "reliability": 95,
      "tags": ["tiểu sử", "thời trẻ"]
    },
    {
      "id": "nt-002",
      "content": "Năm 1417, Nguyễn Trãi vào Lam Sơn theo phò Lê Lợi. Ông soạn thảo hàng nghìn bức thư dụ hàng quân Minh — chiến lược 'tâm công' quan trọng hơn dùng binh.",
      "source": "Lam Sơn thực lục",
      "reliability": 90,
      "tags": ["khởi nghĩa Lam Sơn", "vai trò quân sư"]
    },
    {
      "id": "nt-003",
      "content": "Bình Ngô Đại Cáo được Nguyễn Trãi soạn năm 1428 theo lệnh Lê Lợi sau chiến thắng. Văn bản khẳng định chủ quyền dân tộc, được coi là 'Tuyên ngôn độc lập' đầu tiên của Việt Nam.",
      "source": "Bình Ngô Đại Cáo (nguyên văn); Nguyễn Trãi toàn tập",
      "reliability": 99,
      "tags": ["Bình Ngô Đại Cáo", "văn học", "độc lập"]
    },
    {
      "id": "nt-004",
      "content": "Năm 1442, Nguyễn Trãi bị vu oan trong vụ án Lệ Chi Viên. Vua Lê Thái Tông qua đời đột ngột tại nhà ông ở Lệ Chi Viên. Ông bị tru di tam tộc — hình phạt nặng nhất thời phong kiến.",
      "source": "Đại Việt sử ký toàn thư, Quyển XI",
      "reliability": 92,
      "tags": ["vụ án Lệ Chi Viên", "bi kịch"]
    }
  ]
}
```
 
### Event file — `src/data/events/khoi-nghia-lam-son.json`
 
```json
{
  "id": "khoi-nghia-lam-son",
  "type": "event",
  "name": "Khởi nghĩa Lam Sơn",
  "period_start": 1418,
  "period_end": 1427,
  "short_desc": "Cuộc khởi nghĩa giải phóng dân tộc do Lê Lợi lãnh đạo, chấm dứt 20 năm đô hộ của nhà Minh.",
  "related_people": ["le-loi", "nguyen-trai", "tran-nguyen-han"],
  "related_events": ["binh-ngo-dai-cao", "chien-thang-tot-dong"],
  "timeline": [
    { "year": 1418, "event": "Lê Lợi phất cờ khởi nghĩa tại Lam Sơn, Thanh Hóa" },
    { "year": 1423, "event": "Tạm hòa với quân Minh, củng cố lực lượng" },
    { "year": 1424, "event": "Tiến vào Nghệ An, mở rộng căn cứ địa" },
    { "year": 1426, "event": "Đại thắng tại Tốt Động - Chúc Động" },
    { "year": 1427, "event": "Vây hãm Đông Quan, quân Minh đầu hàng" }
  ],
  "perspectives": {
    "le-loi": {
      "persona": "Lê Lợi — người lãnh đạo",
      "system_prompt": "Mày là Lê Lợi, người sáng lập nhà Lê, lãnh đạo khởi nghĩa Lam Sơn. Kể về cuộc khởi nghĩa từ góc nhìn người chỉ huy tối cao — quyết sách chiến lược, khó khăn, ý chí."
    },
    "nguyen-trai": {
      "persona": "Nguyễn Trãi — quân sư",
      "system_prompt": "Mày là Nguyễn Trãi, quân sư của Lê Lợi. Kể về khởi nghĩa từ vai trò người soạn thảo chiến lược ngoại giao và 'tâm công' — dụ hàng hơn đánh."
    },
    "historian": {
      "persona": "Sử gia hiện đại",
      "system_prompt": "Phân tích khởi nghĩa Lam Sơn từ góc độ sử học hiện đại: nguyên nhân, diễn biến, bài học lịch sử. Trích nguồn rõ ràng."
    }
  },
  "chunks": [
    {
      "id": "ls-001",
      "content": "Năm 1418, Lê Lợi — một hào trưởng ở Lam Sơn, Thanh Hóa — phất cờ khởi nghĩa chống quân Minh đang đô hộ nước ta từ năm 1407. Ban đầu nghĩa quân chỉ vài trăm người, gặp nhiều thất bại.",
      "source": "Đại Việt sử ký toàn thư, Quyển X",
      "reliability": 95,
      "tags": ["khởi đầu", "Lê Lợi"]
    },
    {
      "id": "ls-002",
      "content": "Chiến lược 'tâm công' của Nguyễn Trãi — dùng thư từ dụ hàng quân Minh thay vì đánh trực diện — được coi là yếu tố then chốt giúp nghĩa quân tiết kiệm lực lượng và phân hóa địch.",
      "source": "Lam Sơn thực lục; Nguyễn Trãi toàn tập",
      "reliability": 88,
      "tags": ["chiến lược", "Nguyễn Trãi", "tâm công"]
    }
  ]
}
```
 
### Index file — `src/data/index.json`
 
```json
{
  "entities": [
    { "id": "nguyen-trai", "type": "person", "name": "Nguyễn Trãi", "period": "Hậu Lê sơ", "tags": ["quân sư", "nhà thơ"] },
    { "id": "le-loi", "type": "person", "name": "Lê Lợi", "period": "Hậu Lê sơ", "tags": ["vua", "khởi nghĩa"] },
    { "id": "tran-hung-dao", "type": "person", "name": "Trần Hưng Đạo", "period": "Nhà Trần", "tags": ["tướng quân"] },
    { "id": "khoi-nghia-lam-son", "type": "event", "name": "Khởi nghĩa Lam Sơn", "period": "1418-1427", "tags": ["kháng chiến"] },
    { "id": "chien-thang-bach-dang", "type": "event", "name": "Chiến thắng Bạch Đằng", "period": "1288", "tags": ["trận đánh"] }
  ]
}
```
 
---
 
## 🔌 CLAUDE API — CÁCH GỌI
 
### `src/services/claudeApi.js`
 
```javascript
// Gọi thẳng Anthropic API từ Netlify Function (KHÔNG gọi từ frontend)
// File: netlify/functions/chat.js
 
export async function callClaude({ systemPrompt, messages, maxTokens = 1000 }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages
    })
  });
  return response.json();
}
```
 
> API key để trong Netlify Environment Variables, KHÔNG để trong frontend.
 
---
 
## 🖥️ CÁC MÀN HÌNH CẦN BUILD
 
### 1. Home (`/`)
- Thanh search lớn
- Gợi ý nhanh: Nguyễn Trãi / Trần Hưng Đạo / Khởi nghĩa Lam Sơn
- Nút: "Chat với nhân vật" | "Luyện quiz" | "Lớp học"
### 2. Entity Page (`/entity/:id`)
- Header: tên + tóm tắt + tags
- Tab: **Tổng quan** | **Timeline** | **Chat** | **Nguồn**
- CTA: dropdown chọn góc nhìn → vào Chat
### 3. Chat Page (`/chat/:entityId`)
- Selector góc nhìn: Nhập vai | Người cùng thời | Sử gia
- Chat streaming (SSE từ Netlify Function)
- Mỗi tin nhắn: hiển thị citations dưới dạng `[1]` mở rộng
- Nút: "Chuyển góc nhìn" | "Lưu" | "Tạo quiz"
- Thanh độ dài: Ngắn / Vừa / Dài
### 4. Quiz Page (`/quiz/:entityId`)
- 5–10 câu MCQ sinh từ Claude
- Chấm điểm + giải thích + nguồn
- Nút "Lưu kết quả" (yêu cầu login)
### 5. Teacher Page (`/teacher`) — Đơn giản nhất
- Tạo lớp (tên + join code tự sinh)
- Tạo bài tập: chọn entity + yêu cầu
- Xem danh sách học sinh đã nộp
---
 
## 🔑 FIREBASE FIRESTORE SCHEMA
 
```
users/{userId}
  - email, displayName, role (learner|teacher), createdAt
 
conversations/{convId}
  - ownerId, entityId, perspective, messages[], createdAt, visibility
 
quizAttempts/{attemptId}
  - userId, entityId, score, answers[], completedAt
 
classes/{classId}
  - teacherId, name, joinCode, createdAt
 
assignments/{assignmentId}
  - classId, title, entityId, dueAt
 
submissions/{submissionId}
  - assignmentId, userId, conversationId, submittedAt
```
 
---
 
## ⚙️ CẤU HÌNH DEPLOY
 
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
 
### `.env.example`
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
ANTHROPIC_API_KEY=      ← chỉ dùng trong Netlify Functions, không VITE_
```
 
---
 
## 🚫 RÀNG BUỘC BẮT BUỘC
 
1. **API key Anthropic KHÔNG được expose ra frontend** — phải qua Netlify Function
2. **Không dùng vector DB** — tìm kiếm bằng keyword match trên `index.json`
3. **Không hallucinate** — mọi câu trả lời AI phải bám vào `chunks[]` trong data JSON
4. **Mọi citation phải hiển thị** — format `[1]` inline, expandable ở cuối
5. **Mobile-friendly** — TailwindCSS responsive, test trên 375px
6. **Guest mode** — xem + chat được; login chỉ cần khi lưu
---
 
## 📋 SYSTEM PROMPT CHO AI (dùng trong Netlify Function)
 
```javascript
function buildSystemPrompt(entity, perspective, lengthLevel) {
  const perspectiveConfig = entity.perspectives[perspective];
  const lengthGuide = {
    short:  'Trả lời 5–8 câu.',
    medium: 'Trả lời 3–5 đoạn.',
    long:   'Trả lời đầy đủ: bối cảnh → diễn biến → hệ quả → nhận xét sử học.'
  }[lengthLevel];
 
  return `
${perspectiveConfig.system_prompt}
 
NGUỒN TÀI LIỆU (chỉ dùng thông tin từ đây):
${entity.chunks.map((c, i) => `[${i+1}] ${c.content} (Nguồn: ${c.source})`).join('\n')}
 
QUY TẮC BẮT BUỘC:
- Mọi khẳng định phải có citation [số] cuối câu
- Nếu thông tin không có trong nguồn, nói rõ: "Không có đủ tư liệu để khẳng định điều này"
- Phân biệt rõ: SỰ KIỆN (có nguồn) vs DIỄN GIẢI (suy luận hợp lý)
- ${lengthGuide}
- Trả lời hoàn toàn bằng tiếng Việt
`.trim();
}
```
 
---