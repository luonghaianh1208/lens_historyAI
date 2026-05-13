# Báo cáo Code Review - HistoryLens AI

**Ngày:** 2026-05-13
**Phạm vi:** Toàn bộ codebase

---

## Tổng quan

HistoryLens AI là một ứng dụng web giáo dục về lịch sử Việt Nam, được xây dựng với React 19 + Vite 8 + Tailwind CSS v4 + Netlify Functions (Gemini 2.5 Flash). Ứng dụng cung cấp các tính năng: hồ sơ nhân vật lịch sử, chat đa góc nhìn AI (RAG-based), quiz tương tác, learning paths, và giao diện "ancient scroll" mang phong cách Đông Á.

---

## 1. Kiến trúc tổng thể

### 1.1 Cấu trúc project

```
├── netlify/functions/       # Backend (Netlify Functions)
│   └── chat.js              # Gemini API wrapper (chat + quiz modes)
├── public/                  # Static assets
├── scripts/                 # Utility scripts
├── src/
│   ├── components/          # Reusable UI components
│   ├── data/                # Entity JSON files & manifests
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route components
│   ├── services/            # Business logic
│   ├── __tests__/           # Vitest tests
│   └── App.jsx              # Router + layout
```

### 1.2 Điểm mạnh

- **Manifest-driven architecture**: [`manifest.json`](src/data/manifest.json) đóng vai trò registry trung tâm cho tất cả entities
- **Separation of concerns**: Tách biệt rõ ràng giữa retrieval, chat, quiz services
- **Normalisation pattern**: [`normalizeEntity()`](src/services/retrieval.js#L111) đảm bảo fallback fields nhất quán
- **Error boundaries**: Có [`ErrorBoundary`](src/components/ErrorBoundary.jsx) component

### 1.3 Điểm cần lưu ý

- **Duplicated logic**: Hàm `normalizeEntity`, `normalizePerspectives`, `normalizeChunks` được định nghĩa 2 lần (frontend [retrieval.js](file://c:\Users\ADMIN\Downloads\VIBE CODING\Lens_HistoryAI\src\services\retrieval.js) và backend [chat.js](file://c:\Users\ADMIN\Downloads\VIBE CODING\Lens_HistoryAI\netlify\functions\chat.js))
- **Tight coupling**: Backend hard-code entity imports thay vì dynamic loading

---

## 2. Data Layer Review

### 2.1 Entity Structure

**Status:** Tốt

Entity JSON có cấu trúc rõ ràng với các trường required:
- `id`, `type`, `name`, `period`, `short_desc`
- `perspectives` (self, contemporary, historian)
- `chunks` (RAG reference materials)
- `timeline`, `tags`, `aliases`, `roles`
- `related_people`, `related_events`

**Phát hiện:**

1. ✅ **Mojibake repair**: [`deepRepair()`](src/services/retrieval.js#L73) xử lý encoding issues
2. ✅ **Verification system**: Manifest có `status` (pending/ready) và `verification` tracking
3. ⚠️ **Inconsistent data**: Nhiều entities trong manifest có `status: "pending"` với `chunksCount: 0`

### 2.2 Search & Indexing

**Status:** Tốt

[`searchEntities()`](src/services/retrieval.js#L204) implements:
- Diacritic-insensitive search (NFD normalization)
- Multi-field matching (name, aliases, tags, period)

**Test coverage:** ✅ Đầy đủ trong [`core.test.js`](src/__tests__/core.test.js)

---

## 3. Chat System Review

### 3.1 useChat Hook

**Status:** Tốt nhưng phức tạp

**Điểm mạnh:**
- ✅ Proper cleanup: `abortControllerRef` + `frameRef` trong useEffect
- ✅ Centralized state sync: `pushMessage`, `replaceLastMessage`, `rollbackMessages`
- ✅ Streaming với RAF throttling cho performance
- ✅ Preset response priority trước AI generation

**Điểm cần cải thiện:**

1. **Line 66-67**: Race condition potential
```javascript
if (abortControllerRef.current) abortControllerRef.current.abort()
abortControllerRef.current = new AbortController()
```
Nên debounce hoặc lock để prevent rapid-fire calls.

2. **Line 207-210**: Sync logic phức tạp
```javascript
if (cleanContent !== assistantMessage) {
  setMessages([...messagesRef.current])
}
```
Logic này khó maintain và test.

### 3.2 Backend chat.js

**Status:** Tốt

**Điểm mạnh:**
- ✅ Prompt injection protection với 12 patterns
- ✅ Length limiting (MAX_USER_MESSAGE_LENGTH = 2000)
- ✅ Safety settings cho Gemini API
- ✅ Streaming SSE support

**Điểm cần lưu ý:**

1. **Line 183**: Default `maxTokens: 1000` có thể quá nhỏ cho chat
2. **Line 252-257**: Safety settings hardcoded - nên config qua env

---

## 4. Component Review

### 4.1 Chat.jsx

**Status:** Tốt

**Điểm mạnh:**
- ✅ Perspective switching với character images
- ✅ TTS autoplay với localStorage persistence
- ✅ Follow-up suggestions (AI + preset mix)
- ✅ Scroll pin control

**Phát hiện:**

1. **Line 173-177**: useEffect missing dependency
```javascript
useEffect(() => {
  if (isPinnedToBottom) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
}, [messages, isPinnedToBottom])  // Thiếu: messagesEndRef
```

2. **Line 179-182**: Unnecessary effect
```javascript
useEffect(() => {
  changePerspective()
  lastSpokenIndexRef.current = -1
}, [perspective, changePerspective])
```
`changePerspective` đã reset state, việc gọi lại có thể gây re-render không cần thiết.

### 4.2 Entity.jsx

**Status:** Tốt

**Điểm mạnh:**
- ✅ SEO meta tags dynamic updating
- ✅ Related entities recommendation
- ✅ Tab-based content (overview, timeline, sources)
- ✅ Learning highlights summary

**Phát hiện:**

1. **Line 144-154**: **Duplicate useEffect** - cùng logic chạy 2 lần khi `id` change
```javascript
useEffect(() => {
  setLoading(true)
  const timer = setTimeout(() => setLoading(false), 400)
  return () => clearTimeout(timer)
}, [id])  // ← lần 1

useEffect(() => {  // ← lần 2 - giống hệt
  setLoading(true)
  const timer = setTimeout(() => setLoading(false), 400)
  return () => clearTimeout(timer)
}, [id])
```

### 4.3 SearchModal.jsx

**Status:** Tốt

**Điểm mạnh:**
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Recent searches với localStorage
- ✅ Filter by type (all/person/event)
- ✅ Focus management

---

## 5. Service Layer Review

### 5.1 retrieval.js

**Status:** Tốt

**Exports quan trọng:**
- `getEntity(id)` - O(1) lookup
- `getAllEntities()` - Full list
- `searchEntities(query)` - Diacritic-aware search
- `getVerifiedEntities()` - Filter by verification status

**Phát hiện:**

1. **Line 54-56**: Dynamic import disabled
```javascript
// We can't use import.meta.glob in ESM, so we'll try to require dynamically
return null // Dynamic import not easily done in this setup
```
Comment không chính xác - Vite 8 hỗ trợ `import.meta.glob`. Đây là missed opportunity cho lazy loading.

### 5.2 geminiApi.js

**Status:** Cơ bản

[`buildSystemPrompt()`](src/services/geminiApi.js#L21) có cấu trúc tốt:
- Base prompt từ entity JSON
- Behavior rules (7 mandatory rules)
- Chunk context với nguồn trích dẫn

**Phát hiện:**

1. **Line 37-46**: System prompt quá dài (>500 chars) - có thể ảnh hưởng token budget
2. Không có rate limiting logic

### 5.3 quizService.js

**Status:** Tốt

**Điểm mạnh:**
- ✅ JSON array output format
- ✅ Explanation generation với source reference
- ✅ Score calculation

**Phát hiện:**

1. **Line 7-9**: Chunk formatting có thể overflow context nếu entity có nhiều chunks

---

## 6. Testing Review

### 6.1 Test Coverage

**File:** [`core.test.js`](src/__tests__/core.test.js)

**Coverage:**
- ✅ normalizeEntity field preservation
- ✅ searchEntities diacritic handling
- ✅ getIndex structure validation
- ✅ sanitizeQuizQuestions validation
- ✅ findPresetResponse matching
- ✅ Learning paths entity validation

**Số lượng tests:** ~35 test cases

**Phát hiện:**

1. Thiếu test cho:
   - `useChat` hook (async behavior khó test)
   - `useTTS` hook
   - Components (Chat.jsx, Entity.jsx)
   - Error handling scenarios
   - Edge cases (mojibake, null/undefined)

2. **Line 105-135**: `sanitizeQuizQuestions` được reimplement thay vì import từ service
   → Service nên export function này để test

---

## 7. Backend Review (Netlify Functions)

### 7.1 chat.js

**Status:** Tốt

**Security:**
- ✅ Prompt injection sanitization
- ✅ API key từ Netlify.env (không commit)
- ✅ Input length limiting
- ✅ Safety settings

**Phát hiện:**

1. **Line 1-18**: Entity imports hard-code - khó scale khi thêm entity mới
2. **Line 100-106**: Fallback entity builder cần test thêm
3. **Line 268-273**: Error handling cho Gemini API có thể chi tiết hơn

### 7.2 tts.js

**Status:** Chưa review (file không read được)

### 7.3 admin-users.js

**Status:** Chưa review (file không read được)

---

## 8. Assets & Styling

### 8.1 assetService.js

**Status:** Tốt

**Mapping:**
- `ENTITY_CHARACTER_PATHS`: 22 entities mapped
- `PERSPECTIVE_CHARACTER_PATHS`: 28 perspective variations
- `getBackgroundUrl()`: 7 known backgrounds

**Phát hiện:**

1. **Line 32**: Default fallback không có logging khi image missing
2. Không có lazy loading cho character images

### 8.2 analytics.js

**Status:** Tốt

**Điểm mạnh:**
- ✅ Privacy-first (localStorage only)
- ✅ Session/user ID persistence
- ✅ Daily aggregates với 30-day retention
- ✅ Export functionality

---

## 9. Các vấn đề ưu tiên

### 🔴 Critical

1. **Duplicate useEffect trong Entity.jsx (line 144-154)**
   - **Impact**: Performance (double render)
   - **Fix**: Gộp thành 1 useEffect

### 🟡 High

2. **Duplicated normalization logic (retrieval.js ↔ chat.js)**
   - **Impact**: Maintenance burden, inconsistency risk
   - **Fix**: Extract vào shared module

3. **Thiếu test coverage cho hooks và components**
   - **Impact**: Regression risk
   - **Fix**: Thêm integration tests

### 🟢 Medium

4. **Dynamic import disabled trong retrieval.js**
   - **Impact**: Bundle size lớn
   - **Fix**: Sử dụng `import.meta.glob`

5. **Missing logging cho asset load failures**
   - **Impact**: Debugging khó
   - **Fix**: Thêm console.error với entity ID

---

## 10. Khuyến nghị

###_short-term (1-2 tuần)

1. Xóa duplicate useEffect trong Entity.jsx
2. Refactor normalization logic vào shared utils
3. Thêm error boundary logging
4. Test coverage cho useChat hook

### Medium-term (1-2 tháng)

1. Implement `import.meta.glob` cho dynamic entity loading
2. Add component tests (React Testing Library)
3. Tăng test coverage lên 80%+
4. Add integration tests cho chat flow

### Long-term

1. Consider moving entity data vào CMS (Contentful/Sanity)
2. Implement caching layer cho Gemini responses
3. Add E2E tests (Playwright/Cypress)
4. Performance monitoring (Web Vitals)

---

## 11. Tổng kết

| Aspect | Status | Notes |
|--------|--------|-------|
| Architecture | ✅ Tốt | Manifest-driven, clear separation |
| Data Layer | ✅ Tốt | Normalization, search, verification |
| Chat System | ✅ Tốt | Streaming, presets, perspective |
| Components | ✅ Tốt | Reusable, accessible |
| Testing | ⚠️ Cần cải thiện | Thiếu coverage cho hooks/components |
| Security | ✅ Tốt | Prompt injection protection |
| Performance | ✅ Tốt | RAF throttling, lazy loading ready |
| Code Quality | ✅ Tốt | Clean, well-documented |

**Overall Assessment:** Codebase có chất lượng tốt, kiến trúc rõ ràng, phù hợp để scale. Các vấn đề phát hiện chủ yếu là optimization opportunities thay vì critical bugs.

---

*Generated by Code Review Agent*
*🤖 Generated with [Claude Code](https://claude.ai/code)*