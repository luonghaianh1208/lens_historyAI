# Kiến trúc Hệ Thống (Architecture)

## Sơ đồ luồng Authentication
- **Luồng Auth**: 
  - Ứng dụng dùng Firebase `GoogleAuthProvider` cho đăng nhập (SSO).
  - Khởi tạo lắng nghe trạng thái đăng nhập thông qua `onAuthStateChanged` (trong `src/hooks/useAuth.js`).
  - Dữ liệu `user` và state `loading` được trả về cho Root / Pages quản lý.
  - Sau khi đăng nhập, hệ thống dựa vào định danh (phân quyền cho luồng Giáo viên - `Teacher.jsx`).

## Mối Quan Hệ Giữa Các Module
- **Trang chủ (`Home.jsx`)**: Điểm bắt đầu, hiển thị danh sách các nhân vật và sự kiện lịch sử thông qua thẻ bài.
- **Trang Chi Tiết (`Entity.jsx`)**: Thông tin sơ lược của 1 nhân vật/sự kiện, là điểm trung chuyển điều hướng người dùng tới Quiz hoặc Chat.
- **Tính năng AI Chat (`Chat.jsx` & `useChat.js`)**: 
  - Khởi tạo system prompt chuẩn form thông qua profile của nhân vật tĩnh (`src/data/entities/*`).
  - Gọi Netlify Function `/chat` liên tục. Endpoint streaming dữ liệu trực tiếp về frontend tạo hiệu ứng gõ phím.
- **Tính năng Trắc nghiệm (`Quiz.jsx` & `quizService.js`)**: Trình bày câu hỏi kiểm tra kiến thức về Entity.
- **Chế độ Giáo Viên (`Teacher.jsx`)**: Giao diện (dự kiến/hiện hữu) dành cho giáo viên kiểm tra và quản lý lớp học/dữ liệu học sinh.

## Custom Hooks
- **`useAuth.js`**:
  - `user`: Trạng thái thông tin tài khoản Firebase.
  - `loading`: State chặn các tiến trình khi auth provider chưa initialize xong.
  - `login()`: Trigger Google Sign-In pop-up.
  - `logout()`: Xử lý quy trình Sign Out.
- **`useChat.js`**:
  - Chức năng: Đóng gói API Fetch stream + History memory quản lý hội thoại. 
  - Input: Cần `entityId` + context truyền đạt (góc nhìn: tự sự/bên lề) + độ dài câu trả lời.
  - Hoạt động: Lưu state mảng `messages`, ghép System Prompt vào body (chuẩn SSE) gửi xuống API. Hỗ trợ fallback mock nếu chạy chế độ dev không Netlify CLI.

## Cơ sở dữ liệu và Firebase Services
Về căn bản hệ thống đã cấu hình Firebase `firestore` và `auth` nhưng hiện tại:
- **Dữ liệu tĩnh**: Hầu hết nội dung lịch sử đều đang đọc tĩnh từ JSON trong `src/data/`. `retrieval.js` đảm nhận nhiệm vụ fetch các file này nội bộ.
- **Cloud Firestore**: Configurate đã có `export const db = getFirestore(app)`. Phần lớn data người dùng sẽ mở rộng tại đây, ví dụ: Lịch sử hoàn thành trắc nghiệm, lịch sử chat cá nhân hoá, tiến độ của học sinh tham gia lớp (phục vụ chức năng Teacher).
- **Security Rules**: (*Cần bổ sung chi tiết theo sau khi app lên scale - chưa define rõ rệt trong rule Firestore root*).
- **Backend API**: `netlify/functions/chat.js` xử lý Server-Side integration kết nối với Gemini (`gemini-2.5-flash`), giấu secret `GEMINI_API_KEY` ngăn lộ lộ trên phía Frontend.
