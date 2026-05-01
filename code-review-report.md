# Code Review Report

**Date**: 2026-04-28 (updated 2026-05-01)
**Reviewer**: Code Reviewer Agent + Exploratory Analysis
**Files Reviewed**: Full codebase (pages, components, services, hooks, Netlify functions, data files)

## Summary

Codebase có chất lượng tổng thể khá tốt, tuân thủ React patterns và CLAUDE.md guidelines. Architecture rõ ràng theo Facade + Service Layer pattern. Tuy nhiên có một số runtime crash points, logic issues, performance concerns, và security issues cần chú ý.

- **18 issues found**
- 4 HIGH priority (có thể gây crash)
- 4 MEDIUM priority (logic/security issues)
- 10 LOW priority (code quality / performance)

---

## Issues Found

### HIGH Priority

#### 1. Entity.jsx line 40 - Crash khi entity không có `period`

- **File**: `src/pages/Entity.jsx`
- **Line**: 40
- **Description**: Code truy cập `entity.period` nhưng event entities (như `khoi-nghia-lam-son`) không có field `period`, chỉ có `period_start` và `period_end`. Điều này gây ra hiển thị "undefined–undefined" hoặc crash.
- **Current Code**:
```jsx
<p className="text-sm text-gray-500">{entity.period || `${entity.period_start}–${entity.period_end}`}</p>
```
- **Suggested Fix**:
```jsx
<p className="text-sm text-gray-500">
  {entity.period || (entity.period_start ? `${entity.period_start}${entity.period_end ? `–${entity.period_end}` : ''}` : '')}
</p>
```

---

#### 2. useChat.js line 131 vs Chat.jsx line 63 - Function signature mismatch

- **File**: `src/hooks/useChat.js` line 131
- **Description**: `changePerspective` được định nghĩa là `useCallback(() => {...}, [])` - không nhận tham số. Nhưng trong `Chat.jsx` line 63, nó được gọi với argument: `changePerspective(perspective)`. Argument bị ignore, nhưng đây là một logic bug tiềm ẩn.
- **Current Code** (useChat.js):
```javascript
const changePerspective = useCallback(() => {
  setMessages([])
  messagesRef.current = []
}, [])
```
- **Current Code** (Chat.jsx):
```javascript
useEffect(() => {
  changePerspective(perspective)  // perspective bị ignore!
}, [perspective])
```
- **Suggested Fix**: Đồng nhất function signature. Nếu muốn clear messages khi perspective thay đổi:
```javascript
const changePerspective = useCallback((newPerspective) => {
  setMessages([])
  messagesRef.current = []
}, [])
```

---

#### 3. Chat.jsx line 80 - Entity check không đầy đủ cho events

- **File**: `src/pages/Chat.jsx`
- **Line**: 45
- **Description**: Khi entity là event (như `khoi-nghia-lam-son`), default perspective được tính là `perspectiveEntries[0]?.[0]`. Vấn đề: nếu event có perspectives như `{le-loi: ..., nguyen-trai: ..., historian: ...}`, perspective mặc định sẽ là `le-loi`. Nhưng nếu navigate trực tiếp đến `/chat/khoi-nghia-lam-son` mà không có query param, `defaultPerspective` sẽ là key đầu tiên của object - có thể không phải perspective mong muốn.
- **Current Code**:
```javascript
const defaultPerspective = searchParams.get('perspective') || perspectiveEntries[0]?.[0] || 'self'
```
- **Suggested Fix**: Thêm validation để đảm bảo perspective tồn tại trong entity.perspectives:
```javascript
const validPerspective = perspectiveEntries.find(([key]) => key === searchParams.get('perspective'))?.[0]
const defaultPerspective = validPerspective || perspectiveEntries[0]?.[0] || 'historian'
```

---

#### 4. ErrorBoundary.jsx lines 17-20 - Dùng `window.location.href` thay vì React Router

- **File**: `src/components/ErrorBoundary.jsx`
- **Lines**: 17-20
- **Description**: Khi reset error, component dùng `window.location.href = '/'` để redirect về trang chủ. Điều này gây full page reload và mất tất cả client-side state.
- **Current Code**:
```javascript
handleReset = () => {
  this.setState({ hasError: false, error: null })
  window.location.href = '/'  // Full page reload!
}
```
- **Suggested Fix**: Sử dụng React Router navigation hook (`useNavigate`) hoặc `withRouter` HOC để navigate mà không reload.

---

### MEDIUM Priority

#### 5. retrieval.js line 32 - Potential crash khi entity.name là undefined

- **File**: `src/services/retrieval.js`
- **Line**: 32
- **Description**: `entity.name.toLowerCase()` sẽ crash nếu `name` là undefined hoặc null. Không có null check.
- **Current Code**:
```javascript
const nameMatch = entity.name.toLowerCase().includes(q)
```
- **Suggested Fix**:
```javascript
const nameMatch = entity.name?.toLowerCase().includes(q) || false
```

---

#### 6. Quiz.jsx lines 102-105 - Regex JSON extraction có thể match sai

- **File**: `src/pages/Quiz.jsx`
- **Lines**: 102-105
- **Description**: Regex `/\[[\s\S]*\]/` match từ `[` đầu tiên đến `]` cuối cùng. Nếu response chứa text ngoài JSON array (như mô tả trước/sau), có thể extract sai. Hiện tại có try-catch nhưng không ideal.
- **Current Code**:
```javascript
const jsonMatch = text.match(/\[[\s\S]*\]/)
if (jsonMatch) {
  const parsed = JSON.parse(jsonMatch[0])
  // ...
}
```
- **Suggested Fix**: Cải thiện regex để extract JSON array chính xác hơn, hoặc tìm JSON trong response.text bằng cách tìm markers:
```javascript
// Tìm từ "[" đầu tiên trong response
const jsonStart = text.indexOf('[')
const jsonEnd = text.lastIndexOf(']')
if (jsonStart !== -1 && jsonEnd !== -1) {
  const jsonText = text.slice(jsonStart, jsonEnd + 1)
  // parse...
}
```

---

#### 7. Chat.jsx line 25 - messagesRef mutation during render

- **File**: `src/pages/Chat.jsx`
- **Line**: 25
- **Description**: `messagesRef.current` được mutate trong khi đang gọi `setMessages` - có thể gây inconsistency giữa ref và state khi React strict mode enabled.
- **Current Code**:
```javascript
const userMsg = { role: 'user', content: userMessage, timestamp: Date.now() }
messagesRef.current = [...messagesRef.current, userMsg]  // Mutation!
setMessages((prev) => [...prev, userMsg])  // setState
```
- **Suggested Fix**: Tách biệt logic. Không mutate ref cùng lúc với setState. Cân nhắc chỉ dùng state hoặc chỉ dùng ref, không đồng thời.

---

#### 8. useChat.js lines 64-75 - DEV mode bypass logic không rõ ràng

- **File**: `src/hooks/useChat.js`
- **Lines**: 64-75
- **Description**: DEV mode mock bypass xảy ra khi không có `VITE_NETLIFY` flag set, nhưng không có visual indicator cho user biết họ đang ở dev mode. Logic này có thể confuse khi deploy mà quên set flag.
- **Current Code**:
```javascript
if (import.meta.env.DEV && !import.meta.env.VITE_NETLIFY) {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const mockResponse = { ... }
}
```
- **Suggested Fix**: Thêm warning toast hoặc badge khi dev mock đang active. Hoặc log warning khi dev mode detect.

---

### LOW Priority

#### 9. Chat.jsx lines 13-36 - Functions được định nghĩa trong component body

- **File**: `src/pages/Chat.jsx`
- **Lines**: 13-36
- **Description**: `getPerspectiveEntries`, `getPerspectiveLabel`, `getQuickSuggestions` được định nghĩa trong component body thay vì bên ngoài hoặc wrap với `useMemo`. Mỗi lần render, các functions mới được tạo (dù không impact performance đáng kể).
- **Suggested Fix**: Đặt ngoài component (file-level) nếu không cần closure, hoặc dùng `useMemo`/`useCallback` nếu cần referential stability.

---

#### 10. chatPresetService.js - File quá lớn (27K+ tokens)

- **File**: `src/services/chatPresetService.js`
- **Description**: Single file chứa tất cả preset responses. Khó maintain, review, và debug.
- **Suggested Fix**: Split thành nhiều files theo entity hoặc theo category (ví dụ: `presets/nguyen-trai.js`, `presets/le-loi.js`, etc.)

---

#### 11. Magic numbers không centralized

- **Files**: Nhiều files
- **Description**: Các hằng số như `MAX_TTS_CHARS = 450`, `SILENCE_PADDING_MS = 80`, `MAX_QUIZ_QUESTIONS = 5` được hardcode trực tiếp trong code.
- **Suggested Fix**: Tạo file `src/constants.js` để centralize tất cả magic numbers.

---

#### 12. Quiz.jsx line 174 - sessionStorage cache không có try-catch

- **File**: `src/pages/Quiz.jsx`
- **Line**: 174
- **Description**: `JSON.parse(cachedValue)` được gọi mà không có try-catch. Nếu cache bị corrupted, app sẽ crash.
- **Current Code**:
```javascript
const parsed = sanitizeQuizQuestions(JSON.parse(cachedValue))  // No try-catch!
```
- **Suggested Fix**: Wrap trong try-catch, fall back về fresh generation nếu parse fails.

---

#### 13. AbortController cleanup missing

- **File**: `src/hooks/useChat.js`
- **Description**: `abortControllerRef` được tạo nhưng không cleanup khi component unmount. Có thể gây memory leak nếu request đang in-flight khi unmount.
- **Suggested Fix**: Cleanup trong useEffect return:
```javascript
useEffect(() => {
  return () => {
    abortControllerRef.current?.abort()
  }
}, [])
```

---

#### 14. SearchModal - getIndex() được gọi trong map

- **File**: `src/components/SearchModal.jsx`
- **Lines**: 22-28
- **Description**: `getIndex()` được gọi lặp đi lặp lại bên trong `recentSearches.map()`. Function này regenerate index mỗi lần.
- **Suggested Fix**: Cache `getIndex()` result hoặc build lookup map trước.

---

#### 15. Image optimization - Không có lazy loading ngoài Entity page

- **Files**: Nhiều components
- **Description**: Character images và background images không có lazy loading. Trang Home và Chat load tất cả images ngay lập tức.
- **Suggested Fix**: Thêm `loading="lazy"` attribute hoặc dùng React lazy/suspense cho image-heavy components.

---

#### 16. AnimatedBackground - Particle recalculation không memoized

- **File**: `src/components/AnimatedBackground.jsx`
- **Description**: Particles được recalculated mỗi khi mode thay đổi, nhưng không có memoization.
- **Suggested Fix**: Memoize particle calculations với `useMemo`.

---

#### 17. MessageBubble không có React.memo

- **File**: `src/components/MessageBubble.jsx` (nếu có) hoặc `src/pages/Chat.jsx`
- **Description**: MessageBubble component không được wrap với React.memo, gây re-render không cần thiết khi parent re-renders.
- **Suggested Fix**: Wrap với `React.memo(MessageBubble)`.

---

#### 18. Toast notification - Module-level store có thể gây memory leak

- **File**: `src/components/Toast.jsx`
- **Description**: Toast sử dụng module-level store (biến global bên ngoài component). Không có cleanup mechanism khi module unload.
- **Suggested Fix**: Đảm bảo cleanup được gọi khi app unmount hoặc chuyển sang React context.

---

## Security Issues

### Chat messages không có sanitization - Prompt Injection có thể xảy ra

- **File**: `src/pages/Chat.jsx` và `netlify/functions/chat.js`
- **Description**: User input được gửi trực tiếp đến Gemini API mà không có sanitization. Attacker có thể inject malicious prompts qua user messages.
- **Suggested Fix**: Thêm input sanitization ở frontend hoặc system prompt engineering để detect và block injection attempts. Cân nhắc dùng Gemini's safety settings.

---

### tts.js - CORS wildcard trên error response

- **File**: `netlify/functions/tts.js`
- **Description**: Error response có `Access-Control-Allow-Origin: *` wildcard. Dù là error response, nên restrict origins.
- **Suggested Fix**: Restrict CORS origin bằng environment variable hoặc specific domain.

---

## Recommendations

### Cao ưu tiên
1. **Fix HIGH issues ngay** - 4 crash points có thể gây app unavailable
2. **Add AbortController cleanup** - Memory leak prevention
3. **Fix sessionStorage JSON.parse** - Crash prevention
4. **Fix messagesRef mutation** - Potential race condition

### Trung bình
5. **Type Safety** - Cân nhắc thêm TypeScript hoặc JSON schema validation
6. **Split chatPresetService.js** - Maintainability
7. **Centralize constants** - Code maintainability
8. **Fix DEV mode bypass** - Deployment safety

### Thấp
9. **Image lazy loading** - Performance optimization
10. **Memoize particles** - Performance optimization
11. **React.memo for MessageBubble** - Render optimization
12. **Security hardening** - Input sanitization, CORS restrictions

---

## Files Analyzed

### Pages
| File | Issues |
|------|--------|
| Home.jsx | Clean, no major issues |
| Entity.jsx | 1 HIGH (period access) |
| Chat.jsx | 3 issues (perspective validation, ref mutation, inline functions) |
| Quiz.jsx | 2 issues (JSON extraction, sessionStorage cache) |

### Components
| File | Issues |
|------|--------|
| ErrorBoundary.jsx | 1 HIGH (window.location.href) |
| SearchModal.jsx | 1 LOW (getIndex in map) |
| AnimatedBackground.jsx | 1 LOW (particle recalculation) |
| Toast.jsx | 1 LOW (module-level store) |

### Services
| File | Issues |
|------|--------|
| geminiApi.js | Clean |
| retrieval.js | 1 MEDIUM (null check on name) |
| quizService.js | Clean |
| chatPresetService.js | 1 LOW (file too large) |
| assetService.js | Clean |
| ttsService.js | Clean |

### Hooks
| File | Issues |
|------|--------|
| useChat.js | 2 issues (changePerspective signature, DEV mode bypass, missing AbortController cleanup) |
| useTTS.js | Clean |
| useLocalStorage.js | Clean |
| useKeyboardShortcut.js | Clean |

### Functions
| File | Issues |
|------|--------|
| netlify/functions/chat.js | Clean, proper error handling |
| netlify/functions/tts.js | 1 SECURITY (CORS wildcard) |

### Data
- All JSON files comply with schema defined in CLAUDE.md
- `khoi-nghia-lam-son.json` và `chien-thang-bach-dang.json` có đúng cấu trúc event với `period_start`/`period_end` thay vì `period`

### App Structure
- `src/App.jsx` - Clean routing setup
- `src/main.jsx` - Correct BrowserRouter wrapping