# Code Review Report

**Date**: 2026-04-28
**Reviewer**: Code Reviewer Agent
**Files Reviewed**:
- src/pages/Home.jsx
- src/pages/Entity.jsx
- src/pages/Chat.jsx
- src/pages/Quiz.jsx
- src/services/geminiApi.js
- src/services/retrieval.js
- src/services/quizService.js
- src/hooks/useChat.js
- netlify/functions/chat.js
- src/data/entities/*.json
- src/data/events/*.json
- src/App.jsx
- src/main.jsx

## Summary

Codebase có chất lượng tổng thể khá tốt, tuân thủ React patterns và CLAUDE.md guidelines. Tuy nhiên có một số runtime crash points và logic issues cần chú ý:

- **6 issues found**
- 3 HIGH priority (có thể gây crash)
- 2 MEDIUM priority (logic issues)
- 1 LOW priority (code quality)

---

## Issues Found

### 🔴 HIGH Priority

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

### 🟡 MEDIUM Priority

#### 4. retrieval.js line 32 - Potential crash khi entity.name là undefined

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

#### 5. Quiz.jsx lines 102-105 - Regex JSON extraction có thể match sai

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

### 🟢 LOW Priority

#### 6. Chat.jsx lines 13-36 - Functions được định nghĩa trong component body

- **File**: `src/pages/Chat.jsx`
- **Lines**: 13-36
- **Description**: `getPerspectiveEntries`, `getPerspectiveLabel`, `getQuickSuggestions` được định nghĩa trong component body thay vì bên ngoài hoặc wrap với `useMemo`. Mỗi lần render, các functions mới được tạo (dù không impact performance đáng kể).
- **Current Code**: Functions defined inline
- **Suggested Fix**: Đặt ngoài component (file-level) nếu không cần closure, hoặc dùng `useMemo`/`useCallback` nếu cần referential stability.

---

## Recommendations

### 1. Type Safety cho JSON data
Cân nhắc thêm TypeScript hoặc ít nhất là JSON schema validation khi import các entity files. Hiện tại, nếu JSON thiếu field required (như `name`), app sẽ crash.

### 2. Error Boundary
Thêm Error Boundary component để catch lỗi React rendering và hiển thị fallback UI thay vì crash toàn bộ app.

### 3. Environment Variable Validation
Trong `netlify/functions/chat.js`, kiểm tra `Netlify.env.get()` trả về undefined thay vì string rỗng. Nếu `GEMINI_API_KEY` không set, API sẽ fail với message không clear.

### 4. Streaming Error Handling
Trong `useChat.js`, nếu SSE stream bị interrupt giữa chừng (network error, server restart), buffer có thể chứa incomplete JSON. Logic hiện tại có handle nhưng có thể improve bằng cách reset buffer khi detect malformed data.

---

## Files Analyzed

### Pages
- `src/pages/Home.jsx` - Clean, no major issues
- `src/pages/Entity.jsx` - 1 HIGH issue (line 40 period access)
- `src/pages/Chat.jsx` - 2 issues (function signature, perspective validation)
- `src/pages/Quiz.jsx` - 1 MEDIUM issue (JSON extraction)

### Services
- `src/services/geminiApi.js` - Clean, well-structured
- `src/services/retrieval.js` - 1 LOW issue (null check on name)
- `src/services/quizService.js` - Clean

### Hooks
- `src/hooks/useChat.js` - 1 HIGH issue (changePerspective signature)

### Functions
- `netlify/functions/chat.js` - Clean, proper error handling

### Data
- All JSON files comply with schema defined in CLAUDE.md
- `khoi-nghia-lam-son.json` và `chien-thang-bach-dang.json` có đúng cấu trúc event với `period_start`/`period_end` thay vì `period`

### App Structure
- `src/App.jsx` - Clean routing setup
- `src/main.jsx` - Correct BrowserRouter wrapping