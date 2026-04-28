# Thông Tin Dự Án (Project Info)

## Tổng quan
- **Tên dự án**: historylens-ai (Lens HistoryAI)
- **Mục tiêu**: Nền tảng học hỏi lịch sử Việt Nam thông qua lăng kính tương tác AI, cho phép người dùng trò chuyện dưới nhiều góc nhìn của các nhân vật/sự kiện lịch sử.
- **Đối tượng sử dụng**: Tất cả mọi người — học sinh, sinh viên và những người yêu thích tìm hiểu lịch sử. Không cần đăng nhập.

## Tech Stack
- **Framework**: React `^19.2.5`
- **Build Tool**: Vite `^8.0.10`
- **Styling**: Tailwind CSS `^4.2.4` + PostCSS
- **Routing**: React Router DOM `^7.14.2`
- **Serverless/Deployment**: Netlify Functions (Node.js)
- **AI Integration**: Gemini 2.5 Flash API (qua Google GenerativeLanguage REST endpoint)

## Cấu trúc thư mục

```text
Lens_HistoryAI/
|   .env.example
|   .gitignore
|   index.html
|   netlify.toml
|   package.json
|   postcss.config.js
|   tailwind.config.js
|   vite.config.js
+---_docs/                 (Tài liệu ngữ cảnh quản lý dự án)
+---netlify/
|   \---functions/         (Serverless endpoints)
|           chat.js
+---public/
\---src/
    |   App.jsx
    |   index.css
    |   main.jsx
    +---components/        (Các react component dùng chung)
    +---data/              (Kho lưu trữ dữ liệu tĩnh dạng JSON)
    |   +---entities/
    |   |       le-loi.json, nguyen-trai.json, tran-hung-dao.json
    |   \---events/
    |           chien-thang-bach-dang.json, khoi-nghia-lam-son.json
    +---hooks/             (Custom hooks: useChat)
    +---pages/             (Các màn hình chính)
    |       Chat.jsx, Entity.jsx, Home.jsx, Quiz.jsx
    \---services/          (API logic)
            geminiApi.js, quizService.js, retrieval.js
```

## Biến môi trường (.env)
- `GEMINI_API_KEY`: API Key dành cho Netlify Function kết nối với Gemini (server-side only, không cần prefix `VITE_`).

## Lệnh chạy
- Khởi chạy môi trường Dev: `npm run dev`
- Build production bundle: `npm run build`
- Chạy Preview: `npm run preview`
- Test với Netlify Functions: `netlify dev`

## File/Folder KHÔNG được can thiệp tùy tiện
- `netlify.toml`: Chứa cấu hình build và rewrite rules cho route SPAs.
- Thư mục `src/data/`: Chứa file JSON cấu trúc cố định, khi tinh chỉnh cần giữ chuẩn schema prompt/character.
- `src/services/geminiApi.js`: Tham số cấu hình AI prompt, thay đổi không cẩn thận sẽ phá hỏng context nhận vật.
