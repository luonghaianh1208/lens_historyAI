# Fix Plan

## Mục tiêu
Sửa các lỗi logic và hành vi còn tồn tại trong `HistoryLens AI`, ưu tiên theo tác động thực tế tới:
- Độ đúng dữ liệu
- Đồng bộ state theo route
- Trải nghiệm Chat / TTS / Search
- Độ ổn định khi phát triển tiếp

## Nguyên tắc thực hiện
- Sửa nhỏ, đúng chỗ
- Không refactor lan sang phần không liên quan
- Mỗi task có tiêu chí hoàn thành rõ ràng
- Sau mỗi nhóm task phải build lại để xác nhận

## Thứ tự ưu tiên
1. Task 1: Sửa `related_events` trong normalization
2. Task 2: Đồng bộ `perspective` theo route trong Chat
3. Task 3: Chốt và sửa behavior TTS
4. Task 4: Nối nút Search ở Home với Search Modal
5. Task 5: Hoàn thiện hoặc bỏ hẳn persist chat nửa vời
6. Task 6: Thu gọn side effect của hotkey `Escape`
7. Task 7: Bổ sung test tối thiểu cho các vùng logic cốt lõi

---

## Task 1: ✅ Sửa `related_events` bị mất trong normalization
> **Đã hoàn thành 2026-05-01.** Thêm `related_events: repaired.related_events || []` vào `normalizeEntity()`.

### Vấn đề
`normalizeEntity()` chưa giữ lại field `related_events`, làm phần "Sự kiện liên quan" không hoạt động đúng dù JSON đã có dữ liệu.

### File liên quan
- `src/services/retrieval.js`
- `src/pages/Entity.jsx`
- `src/data/entities/*.json`
- `src/data/events/*.json`

### Việc cần làm
- Bổ sung `related_events` vào object normalize trả về.
- Đảm bảo field luôn có giá trị mặc định là `[]`.
- Kiểm tra các entity/event hiện có đang khai báo `related_events`.
- Mở lại logic liên kết trong `Entity.jsx` để xác nhận dữ liệu đã chảy đúng tới UI.

### Tiêu chí hoàn thành
- `entity.related_events` luôn tồn tại sau normalize.
- Hồ sơ có `related_events` hiển thị được phần liên quan.
- Không làm ảnh hưởng `related_people` hoặc `tags`.

### Cách verify
- Mở 1 hồ sơ có `related_events`.
- Xem phần "Bạn có thể thích" hoặc phần liên quan có render thêm event đúng không.
- Chạy `npm run build`.

### Mức ưu tiên
- Cao

---

## Task 2: ✅ Đồng bộ `perspective` theo `entityId` và query param trong Chat
> **Đã hoàn thành 2026-05-01.** Thêm `useEffect` sync perspective khi `entityId`/`searchParams` thay đổi, validate key hợp lệ.

### Vấn đề
State `perspective` đang lấy giá trị ban đầu bằng `useState(initialPerspective)`, có nguy cơ giữ góc nhìn cũ khi route đổi từ entity này sang entity khác.

### File liên quan
- `src/pages/Chat.jsx`

### Việc cần làm
- Rà lại cách tính `initialPerspective`.
- Đồng bộ lại `perspective` khi:
  - `entityId` đổi
  - `searchParams` đổi
  - danh sách perspective hợp lệ thay đổi
- Nếu query param không hợp lệ thì fallback về perspective đầu tiên hợp lệ.
- Đảm bảo việc reset chat chỉ xảy ra đúng lúc cần thiết.

### Tiêu chí hoàn thành
- Chuyển giữa 2 entity không bị giữ sai persona cũ.
- `?perspective=...` hợp lệ được áp dụng đúng.
- `?perspective=...` sai không làm vỡ UI.

### Cách verify
- Mở `/chat/nguyen-trai?perspective=historian`.
- Chuyển sang một entity khác bằng link nội bộ.
- Xác nhận tên persona, avatar, quick suggestions và prompt đều đúng.

### Mức ưu tiên
- Cao

---

## Task 3: ✅ Chốt lại behavior TTS và sửa regression
> **Đã hoàn thành 2026-05-01.** Chọn Hướng B (TTS chỉ cho preset). Đổi label "Tự đọc mẫu" / "Tắt đọc mẫu" cho rõ nghĩa.

### Vấn đề
TTS hiện có dấu hiệu chỉ hoạt động cho preset response, trong khi UI vẫn cho cảm giác hỗ trợ mọi câu trả lời assistant.

### File liên quan
- `src/pages/Chat.jsx`
- `src/hooks/useTTS.js`
- `src/services/chatPresetService.js`
- `netlify/functions/tts.js`

### Việc cần làm
- Chọn rõ 1 hướng sản phẩm:
  - Hướng A: TTS cho mọi assistant response
  - Hướng B: TTS chỉ cho preset response
- Nếu chọn Hướng A:
  - Render nút loa cho mọi assistant message.
  - Autoplay áp dụng cho preset và non-preset.
  - Fallback về local TTS hoặc server TTS phù hợp nếu không có preset audio.
- Nếu chọn Hướng B:
  - Ẩn các điều khiển gây hiểu nhầm.
  - Đổi label UI để thể hiện rõ chỉ có câu trả lời mẫu mới có audio.

### Tiêu chí hoàn thành
- Hành vi TTS nhất quán với UI.
- Không còn trạng thái "có toggle nhưng không đọc".
- Không làm vỡ luồng preset audio hiện tại.

### Cách verify
- Gửi 1 câu khớp preset.
- Gửi 1 câu không khớp preset.
- Kiểm tra nút loa, autoplay, stop, speed control có nhất quán không.

### Mức ưu tiên
- Cao

---

## Task 4: ✅ Nối nút Search ở Home với Search Modal
> **Đã hoàn thành 2026-05-01.** Thêm `onClick={onOpenSearch || undefined}` cho icon search trên Home.

### Vấn đề
Nút search icon trên Home nhìn như có chức năng mở modal nhưng hiện chưa gọi `onOpenSearch`.

### File liên quan
- `src/pages/Home.jsx`
- `src/App.jsx`

### Việc cần làm
- Gắn `onClick={onOpenSearch}` cho nút search trên Home.
- Chỉ render hành vi này khi prop `onOpenSearch` tồn tại.
- Giữ nguyên quick search inline hiện tại, không phá flow cũ.

### Tiêu chí hoàn thành
- Click icon search ở Home mở được modal.
- Không ảnh hưởng input search inline.
- Hotkey `Ctrl+K` vẫn hoạt động như cũ.

### Cách verify
- Vào Home.
- Click icon search.
- Kiểm tra modal mở đúng.

### Mức ưu tiên
- Trung bình cao

---

## Task 5: ✅ Hoàn thiện hoặc bỏ hẳn persist chat nửa vời
> **Đã hoàn thành 2026-05-01.** Chọn hướng bỏ hẳn. Xóa `localStorage.setItem` mồ côi trong `useChat.js`.

### Vấn đề
Chat đang ghi localStorage không đầy đủ: mới lưu một phần luồng nhắn tin, chưa thấy khôi phục state lúc mount, dễ tạo hành vi nửa vời.

### File liên quan
- `src/hooks/useChat.js`
- `src/pages/Chat.jsx`
- `src/hooks/useLocalStorage.js`

### Việc cần làm
- Chốt yêu cầu sản phẩm:
  - Có lưu lịch sử chat theo từng entity/perspective hay không
- Nếu có lưu:
  - Rehydrate messages khi vào lại trang chat
  - Persist sau cả user message và assistant message
  - Xóa đúng key khi clear chat
- Nếu không lưu:
  - Bỏ logic localStorage liên quan trong `useChat`
  - Giữ behavior nhất quán, không lưu nửa chừng

### Tiêu chí hoàn thành
- Hành vi chat rõ ràng và nhất quán.
- Không còn localStorage "mồ côi" hoặc dữ liệu lệch UI.

### Cách verify
- Gửi vài tin nhắn.
- Reload trang.
- Kiểm tra kết quả đúng với quyết định sản phẩm.
- Clear chat xong reload lại để xác nhận.

### Mức ưu tiên
- Trung bình cao

---

## Task 6: ✅ Thu gọn side effect của hotkey `Escape`
> **Đã hoàn thành 2026-05-01.** Thêm `enabled` option vào `useKeyboardShortcut`, SearchModal dùng `{ enabled: isOpen }`.

### Vấn đề
`SearchModal` đang đăng ký hotkey `Escape` ngay cả khi modal đóng, dễ gây va chạm với interaction khác trong tương lai.

### File liên quan
- `src/components/SearchModal.jsx`
- `src/hooks/useKeyboardShortcut.js`

### Việc cần làm
- Chỉ bind `Escape` khi modal đang mở.
- Có thể xử lý bằng một trong hai cách:
  - Guard bên trong callback
  - Hoặc nâng cấp hook để hỗ trợ `enabled`
- Chọn cách nhỏ nhất, ít ảnh hưởng nhất.

### Tiêu chí hoàn thành
- `Escape` chỉ đóng modal khi modal đang mở.
- Không làm ảnh hưởng hotkey khác.

### Cách verify
- Khi modal đóng, nhấn `Escape` không gây side effect.
- Khi modal mở, nhấn `Escape` đóng đúng.

### Mức ưu tiên
- Trung bình

---

## Task 7: ✅ Bổ sung test tối thiểu cho các vùng logic cốt lõi
> **Đã hoàn thành 2026-05-01.** Cài `vitest`, thêm `npm test`, 25 test cases pass (normalizeEntity, searchEntities, sanitizeQuizQuestions, findPresetResponse, hasPresetAudio).

### Vấn đề
Dự án hiện chưa có lớp test cơ bản cho các vùng dễ regression.

### File liên quan
- `package.json`
- `src/services/retrieval.js`
- `src/pages/Quiz.jsx` hoặc logic parse/sanitize tách riêng nếu cần
- `src/services/chatPresetService.js`

### Phạm vi test tối thiểu đề xuất
- `normalizeEntity()` giữ đủ field mặc định, gồm cả `related_events`
- `searchEntities()` vẫn tìm được khi bỏ dấu tiếng Việt
- `sanitizeQuizQuestions()` lọc được dữ liệu AI lỗi cấu trúc
- `findPresetResponse()` không match sai quá dễ

### Việc cần làm
- Chọn test runner tối giản phù hợp với Vite, ưu tiên `vitest`.
- Thêm script test cơ bản.
- Chỉ test logic thuần, chưa cần test UI phức tạp ở vòng này.

### Tiêu chí hoàn thành
- Có thể chạy test bằng 1 lệnh.
- Test bao phủ được các bug vừa review.

### Cách verify
- Chạy test pass.
- Chạy `npm run build` vẫn pass.

### Mức ưu tiên
- Trung bình

---

## Gợi ý chia theo đợt triển khai

### Đợt 1: Sửa bug lõi
- Task 1
- Task 2
- Build verify

### Đợt 2: Khép kín trải nghiệm chat
- Task 3
- Task 5
- Build verify

### Đợt 3: Polish hành vi sản phẩm
- Task 4
- Task 6
- Build verify

### Đợt 4: Chống regression
- Task 7

---

## Definition of Done
- Build pass
- Không còn bug đã review ở mức logic cốt lõi
- Chat không giữ state sai giữa các entity
- Search và TTS có hành vi nhất quán với UI
- Có ít nhất một lớp test tối thiểu cho logic quan trọng
