# HistoryLens AI — Claude Code System Prompt

---

## MUC TIEU

Xay dung **HistoryLens AI** — webapp AI nhap vai nhan vat lich su Viet Nam.
Muc tieu: **chay duoc tren Netlify**, dung de thi Tin hoc tre.

---

## STACK

```
Frontend : React + Vite + TailwindCSS
Hosting  : Netlify (deploy tu dong qua GitHub)
AI API   : Google Gemini API (gemini-2.5-flash)
Data     : JSON tinh trong src/data/ (entities + events)
```

> KHONG dung Next.js, KHONG dung Supabase, KHONG dung vector DB.
> Giu stack toi gian de deploy nhanh len Netlify.
> Firebase Auth/Firestore se duoc them sau khi core features on dinh.

---

## CAU TRUC THU MUC

```
historylens-ai/
├── public/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          ← Trang chu + search
│   │   ├── Entity.jsx        ← Chi tiet nhan vat/su kien
│   │   ├── Chat.jsx          ← Chat voi AI
│   │   └── Quiz.jsx          ← Luyen trac nghiem
│   ├── services/
│   │   ├── geminiApi.js       ← build system prompt + goi API helper
│   │   ├── retrieval.js       ← tim kiem trong data JSON
│   │   └── quizService.js     ← tao prompt quiz
│   ├── data/
│   │   ├── entities/          ← file JSON moi nhan vat
│   │   │   ├── nguyen-trai.json
│   │   │   ├── le-loi.json
│   │   │   ├── tran-hung-dao.json
│   │   │   └── ...
│   │   └── events/
│   │       ├── khoi-nghia-lam-son.json
│   │       ├── chien-thang-bach-dang.json
│   │       └── ...
│   ├── hooks/
│   │   └── useChat.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── netlify/
│   └── functions/
│       └── chat.js            ← Netlify Function v2, goi Gemini API
├── netlify.toml
├── package.json
└── CLAUDE.md
```

---

## DATA SCHEMA (JSON)

### Entity (person) — vi du `nguyen-trai.json`

```json
{
  "id": "nguyen-trai",
  "type": "person",
  "name": "Nguyen Trai",
  "aliases": ["Uc Trai"],
  "born": 1380,
  "died": 1442,
  "period": "Hau Le so",
  "roles": ["Quan su", "Nha tho"],
  "tags": ["quan su", "nha tho"],
  "short_desc": "...",
  "related_events": ["khoi-nghia-lam-son"],
  "related_people": ["le-loi"],
  "timeline": [{ "year": 1380, "event": "..." }],
  "perspectives": {
    "self": { "persona": "...", "system_prompt": "..." },
    "contemporary": { "persona": "...", "system_prompt": "..." },
    "historian": { "persona": "...", "system_prompt": "..." }
  },
  "chunks": [
    { "id": "nt-001", "content": "...", "source": "...", "reliability": 95, "tags": [] }
  ]
}
```

### Event — vi du `khoi-nghia-lam-son.json`

Event perspectives co the dung key bat ky (vi du: `le-loi`, `nguyen-trai`, `historian`).
Chat page doc perspectives tu entity data, KHONG hardcode keys.

```json
{
  "id": "khoi-nghia-lam-son",
  "type": "event",
  "perspectives": {
    "le-loi": { "persona": "Le Loi — nguoi lanh dao", "system_prompt": "..." },
    "nguyen-trai": { "persona": "Nguyen Trai — quan su", "system_prompt": "..." },
    "historian": { "persona": "Su gia hien dai", "system_prompt": "..." }
  }
}
```

---

## GEMINI API — CACH GOI

### Netlify Function `netlify/functions/chat.js`

- Dung **Netlify Functions v2** format (`export default async (req) => new Response(...)`)
- Goi Gemini API `gemini-2.5-flash`
- Ho tro streaming (SSE) va non-streaming
- API key: `GEMINI_API_KEY` trong Netlify Environment Variables

### System Prompt

AI duoc cau hinh nhu **chuyen gia lich su Viet Nam** voi vai tro cu the (nhap vai / nguoi cung thoi / su gia).
Hien tai AI tu tra loi dua tren kien thuc cua minh voi vai tro duoc chi dinh.
Sau nay se bo sung chunks[] lam nguon tai lieu bat buoc + citation rules.

```javascript
function buildSystemPrompt(entity, perspective, lengthLevel) {
  const perspectiveConfig = entity.perspectives[perspective]
  const lengthGuide = {
    short:  'Tra loi 5-8 cau.',
    medium: 'Tra loi 3-5 doan.',
    long:   'Tra loi day du: boi canh -> dien bien -> he qua -> nhan xet su hoc.'
  }[lengthLevel]

  return `${perspectiveConfig.system_prompt}

Ban la chuyen gia lich su Viet Nam. Tra loi chinh xac dua tren kien thuc lich su.
Neu khong chac chan, noi ro day la suy doan hoac can xac minh them.
Phan biet ro: SU KIEN (da xac nhan) vs DIEN GIAI (suy luan hop ly).
${lengthGuide}
Tra loi hoan toan bang tieng Viet.`
}
```

---

## CAC MAN HINH

### 1. Home (`/`)
- Thanh search lon
- Goi y nhanh: Nguyen Trai / Tran Hung Dao / Khoi nghia Lam Son
- Feature cards: "Chat voi nhan vat" | "Luyen Quiz"

### 2. Entity Page (`/entity/:id`)
- Header: ten + tom tat + tags
- Tab: **Tong quan** | **Timeline** | **Nguon**
- CTA: dropdown chon goc nhin -> vao Chat

### 3. Chat Page (`/chat/:entityId`)
- Selector goc nhin: doc tu entity.perspectives (dong, khong hardcode)
- Chat streaming (SSE tu Netlify Function)
- Nut: "Chuyen goc nhin" | "Tao quiz"
- Thanh do dai: Ngan / Vua / Dai

### 4. Quiz Page (`/quiz/:entityId`)
- 5 cau MCQ sinh tu Gemini API
- Cham diem + giai thich
- Nut "Lam lai" | "Chat them"

---

## CAU HINH DEPLOY

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
GEMINI_API_KEY=      # chi dung trong Netlify Functions, KHONG VITE_
```

---

## RANG BUOC BAT BUOC

1. **API key KHONG duoc expose ra frontend** — phai qua Netlify Function
2. **KHONG dung vector DB** — tim kiem bang keyword match tren data JSON
3. **AI tu tra loi voi vai tro chuyen biet** — chua yeu cau bam vao chunks (se bo sung sau)
4. **Mobile-friendly** — TailwindCSS responsive
5. **Guest mode** — ai cung truy cap duoc, khong can login
6. **KHONG co trang Teacher** — app cong khai cho moi nguoi

---
