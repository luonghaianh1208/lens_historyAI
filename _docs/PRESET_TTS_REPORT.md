# Preset TTS Report

Ngày cập nhật: 2026-05-01

## Mục tiêu

Giảm tình trạng TTS bị chờ lâu và timeout trên Netlify khi câu trả lời AI quá dài, bằng cách chuyển phần lớn trải nghiệm chat phổ biến sang mô hình:

- Câu hỏi gợi ý có sẵn `preset answer`
- Có sẵn `preset audio`
- Câu hỏi freeform chỉ dùng preset khi match đủ chắc trong đúng `entity + perspective`
- Câu ngoài preset vẫn dùng AI chat, nhưng không auto-TTS runtime như trước

## Kế hoạch đã đặt ra

1. Tách `suggestionCatalog` ra khỏi `Chat.jsx`
2. Tạo service quản lý preset question/answer/audio
3. Thêm matcher bảo thủ cho câu hỏi gần nghĩa
4. Chèn flow preset vào `useChat` trước khi gọi Gemini chat
5. Chỉ cho preset được phát audio, AI động không auto-TTS
6. Tạo script sinh sẵn toàn bộ audio preset
7. Tối ưu prompt TTS để giọng đọc hợp nhân vật, bối cảnh lịch sử và sắc thái vùng miền ở mức khả thi

## Những gì đã thực hiện

### 1. Tạo service preset riêng

Đã thêm file:

- `src/services/chatPresetService.js`

Nội dung đã làm:

- Chuyển toàn bộ quick suggestions hiện có sang catalog preset riêng
- Bổ sung `answer` cho toàn bộ preset
- Bổ sung `audioSrc` theo cấu trúc thư mục tĩnh
- Thêm các hàm:
  - `getQuickSuggestions()`
  - `findPresetResponse()`
  - `hasPresetAudio()`
  - `getPresetCatalog()`

### 2. Tích hợp flow preset vào chat

Đã sửa file:

- `src/hooks/useChat.js`

Nội dung đã làm:

- Khi người dùng gửi câu hỏi, hệ thống sẽ thử `findPresetResponse()` trước
- Nếu match preset:
  - trả lời ngay, không gọi `/.netlify/functions/chat`
  - gắn metadata `source: 'preset'`
  - gắn `audioSrc`, `presetId`, `matchType`, `confidence`
- Nếu không match preset:
  - fallback sang luồng AI cũ
  - gắn `source: 'ai'`

### 3. Cập nhật UI chat

Đã sửa file:

- `src/pages/Chat.jsx`

Nội dung đã làm:

- Import quick suggestions từ service mới thay vì hardcode trong `Chat.jsx`
- Hiển thị nhãn `Câu trả lời mẫu` cho preset message
- Chỉ hiện nút loa với preset message
- Auto-play chỉ áp dụng cho preset
- AI dynamic response không còn auto-TTS runtime như trước

### 4. Bổ sung playback cho preset audio

Đã sửa file:

- `src/hooks/useTTS.js`

Nội dung đã làm:

- Thêm `playUrl()` để phát file audio tĩnh `.wav`
- Thêm `speakLocal()` dùng `speechSynthesis` của browser làm fallback
- Giữ `speak()` cũ cho trường hợp cần TTS runtime sau này
- Thêm logic `stop()` để dừng cả audio HTML5 và browser speech synthesis

### 5. Tạo pipeline generate audio hàng loạt

Đã thêm file:

- `scripts/generate-preset-audio.mjs`

Đã sửa file:

- `package.json`

Nội dung đã làm:

- Thêm script chạy:

```bash
npm run generate:preset-audio
```

- Đọc `GEMINI_API_KEY` từ environment hoặc `.env`
- Gọi Gemini TTS để sinh `.wav`
- Tự skip file đã tồn tại
- Có retry prompt nếu Gemini trả về response không có audio

### 6. Tối ưu tone giọng theo nhân vật

Đã sửa file:

- `src/services/ttsService.js`

Nội dung đã làm:

- Thêm `PRESET_TTS_STYLES` theo `entity + perspective`
- Thêm `getPresetTTSStyle()`
- Thêm `buildStyledTTSText()`
- Prompt TTS được điều chỉnh để:
  - có màu sắc lịch sử
  - gần đúng khí chất từng nhân vật
  - có sắc thái vùng miền nhẹ khi phù hợp
  - ưu tiên rõ chữ, dễ nghe, không bị quá diễn

### 7. Sinh xong audio preset

Kết quả thực tế:

- Đã sinh đủ `99/99` file audio preset
- Thư mục đích:

```text
public/assets/audio/presets/
```

## Kết quả verify

Đã chạy thành công:

```bash
npm run build
```

Đã kiểm tra số file audio:

- Tổng file `.wav`: `99`

## Những lỗi đã gặp trong quá trình làm

### 1. Thiếu `GEMINI_API_KEY` ở lần chạy đầu

Trạng thái:

- Ban đầu script không generate được audio vì `.env` chưa có key

Xử lý:

- Sau khi bạn thêm key, script đã chạy được bình thường

### 2. Gemini có lúc trả về response không chứa audio

Trạng thái:

- Trong lần generate đầu, script bị dừng ở giữa vì gặp lỗi `Gemini did not return audio data`

Xử lý:

- Đã cập nhật script để:
  - retry với prompt đơn giản hơn
  - skip file đã sinh xong
  - tiếp tục generate phần còn lại thay vì dừng toàn bộ

### 3. Job generate audio dài hơn timeout tool

Trạng thái:

- Một lượt generate bị tool timeout do chạy quá lâu

Xử lý:

- Chạy lại với timeout dài hơn
- Script skip file cũ nên hoàn tất phần còn lại mà không bị lặp vô ích

## Các mục đã bổ sung hoàn thiện (2026-05-01)

### 1. ✅ Automated QA cho 99 file audio

Đã thêm file:

- `scripts/qa-preset-audio.mjs`

Nội dung đã làm:

- Script tự động kiểm tra toàn bộ WAV: header, sample rate, channels, duration
- Kết quả: **99/99 PASS**, 0 warning, 0 failure
- Duration: Min 17s | Max 34.2s | Avg 24.1s | Median 24s
- Phân bố: 10-20s: 5 | 20-30s: 92 | 30-45s: 2
- 0 file rỗng, tất cả đều là PCM 24kHz mono hợp lệ

> Lưu ý: Script kiểm tra kỹ thuật. Việc đánh giá chất lượng giọng đọc vẫn cần nghe thủ công theo từng nhóm nhân vật nếu muốn tinh chỉnh sâu hơn.

### 2. ✅ Cải tiến matcher với synonym expansion

Đã sửa file:

- `src/services/chatPresetService.js`

Nội dung đã làm:

- Thêm 22 nhóm synonym tiếng Việt phổ biến (ví dụ: "vì sao" ↔ "tại sao" ↔ "nguyên nhân", "gian nan" ↔ "khó khăn" ↔ "cam go", v.v.)
- Thêm hàm `expandWithSynonyms()` mở rộng token trước khi so khớp
- Tích hợp vào `findPresetResponse()` — cải thiện recall cho paraphrase tự nhiên
- Thêm 2 test cases cho synonym matching, tổng 27/27 pass

> Đây là bước trung gian giữa heuristic thuần và embedding model. Nếu cần matching sâu hơn (e.g., "Bác đã đi tìm đường cứu nước ra sao?" ↔ "Hành trình tìm đường cứu nước của Bác như thế nào?"), sẽ cần embedding hoặc LLM classifier.

### 3. ✅ Dọn sạch runtime TTS code cũ

Đã sửa file:

- `src/hooks/useTTS.js`

Nội dung đã làm:

- Xóa toàn bộ `speak()` function (Netlify runtime TTS pipeline)
- Xóa các helper chỉ phục vụ `speak()`: `fetchSingleChunk`, `fetchAllChunks`, `playAudio`, `playChunksSequentially`, `hashText`, `cleanMarkdown`, `audioCache`
- Xóa import `buildTTSPayload`, `audioBufferToUrl`, `splitIntoChunks` từ ttsService
- Giữ `playUrl()` (phát file WAV tĩnh) và `speakLocal()` (browser speech synthesis fallback)
- Chat bundle giảm 199KB → 196KB, module count 211 → 210

### 4. ℹ️ Vùng miền — best-effort (không thay đổi)

Giới hạn đã biết:

- Gemini TTS không thể đảm bảo 100% độ chính xác vùng miền
- Prompt đã được tối ưu cho từng nhân vật/perspective
- Cần nghe thực tế nếu muốn tinh chỉnh riêng từng file

## Đánh giá cuối cùng

### Đã đạt

- Giảm phụ thuộc vào TTS runtime cho phần chat phổ biến nhất
- Preset Q&A đã có sẵn nội dung và audio (99/99 file hợp lệ)
- Hệ thống đã có fallback an toàn (speakLocal cho browser)
- Matcher đã có synonym expansion cho paraphrase tự nhiên
- Runtime TTS cũ đã được dọn sạch
- Build pass, 27/27 tests pass
- Audio QA automated script sẵn sàng

### Còn có thể làm thêm nếu cần

1. Nghe rà soát audio theo từng nhóm nhân vật (manual QA)
2. Tinh chỉnh giọng cho các file chưa đạt kỳ vọng
3. Nâng cấp matcher lên embedding-based nếu có nhu cầu

## Danh sách file đã thay đổi trong đợt này

- `src/services/chatPresetService.js`
- `src/hooks/useChat.js`
- `src/hooks/useTTS.js`
- `src/pages/Chat.jsx`
- `src/services/ttsService.js`
- `scripts/generate-preset-audio.mjs`
- `scripts/qa-preset-audio.mjs`
- `package.json`
- `public/assets/audio/presets/**`

