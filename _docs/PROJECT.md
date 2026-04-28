# Thông Tin Dự Án (Project Info)

## Tổng quan
- **Tên dự án**: historylens-ai (Lens HistoryAI)
- **Mục tiêu**: Nền tảng học hỏi lịch sử Việt Nam thông qua lăng kính tương tác AI, cho phép người dùng trò chuyện dưới nhiều góc nhìn của các nhân vật/sự kiện lịch sử.
- **Đối tượng sử dụng**: Học sinh, sinh viên, giáo viên và những người yêu thích tìm hiểu lịch sử.

## Tech Stack
- **Framework**: React `^19.2.5`
- **Build Tool**: Vite `^8.0.10`
- **Styling**: Tailwind CSS `^4.2.4` + PostCSS
- **Database/Auth**: Firebase `^12.12.1`
- **Routing**: React Router DOM `^7.14.2`
- **Serverless/Deployment**: Netlify Functions (Node.js)
- **AI Integration**: Gemini 2.5 Flash API (Mặc dù codebase có lưu vết của SDK Anthropic nhưng thực tế API endpoint gọi tới Gemini).

## Cấu trúc thư mục

```text
C:\USERS\ADMIN\DOWNLOADS\VIBE CODING\LENS_HISTORYAI\
|   .env.example
|   .gitignore
|   CLAUDE.md
|   index.html
|   netlify.toml
|   package-lock.json
|   package.json
|   postcss.config.js
|   tailwind.config.js
|   vite.config.js
+---_docs                  (Tài liệu ngữ cảnh quản lý dự án)
+---netlify
|   \---functions          (Serverless endpoints)
|           chat.js
+---public
\---src
    |   App.jsx
    |   index.css
    |   main.jsx
    +---components         (Các react component dùng chung)
    +---data               (Kho lưu trữ dữ liệu tĩnh dạng JSON)
    |   +---entities
    |   |       le-loi.json, nguyen-trai.json, tran-hung-dao.json
    |   \---events
    |           chien-thang-bach-dang.json, khoi-nghia-lam-son.json
    +---hooks              (Custom hooks: useAuth, useChat)
    +---pages              (Các màn hình chính)
    |       Chat.jsx, Entity.jsx, Home.jsx, Quiz.jsx, Teacher.jsx
    \---services           (API logic, config firebase)
            claudeApi.js, firebase.js, quizService.js, retrieval.js
```

## Biến môi trường (.env)
Bắt buộc cấu hình đầy đủ trong file `.env` cục bộ và trên server (Netlify):
- `VITE_FIREBASE_API_KEY`: API Key của dự án Firebase.
- `VITE_FIREBASE_AUTH_DOMAIN`: Domain ủy quyền Firebase Auth.
- `VITE_FIREBASE_PROJECT_ID`: ID dự án Firebase.
- `VITE_FIREBASE_STORAGE_BUCKET`: Storage bucket URL.
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: ID gửi messaging.
- `VITE_FIREBASE_APP_ID`: App ID config.
- `GEMINI_API_KEY`: API Key dành cho Netlify Function kết nối với Gemini (lưu ý không cần prefix `VITE_`). *(Chú ý: `.env.example` đang để `ANTHROPIC_API_KEY` nhưng phần code đã cập nhật sang Gemini)*.

## Lệnh chạy
- Khởi chạy môi trường Dev: `npm run dev`
- Build production bundle: `npm run build`
- Chạy Preview: `npm run preview`

*(Lưu ý: Môi trường Dev của Vite mặc định không chạy chung với Netlify Functions tự động, để test serverless cục bộ, nên dùng `netlify dev`)*

## File/Folder KHÔNG được can thiệp tùy tiện
- `netlify.toml`: Chứa cấu hình build và rewrite rules cho route SPAs.
- Thư mục `src/data/`: Chứa file JSON cấu trúc cố định, khi tinh chỉnh cần giữ chuẩn schema của prompt / character system.
- Tham số cấu hình AI prompt nền tảng trong `src/services/claudeApi.js` (dù là Gemini) nếu thay đổi không cẩn thận sẽ phá hỏng context nhận vật.
