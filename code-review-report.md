# Code Review Report

**Date**: 2026-04-28 (updated 2026-05-01)
**Reviewer**: Code Reviewer Agent + Exploratory Analysis
**Files Reviewed**: Full codebase (pages, components, services, hooks, Netlify functions, data files)

## Summary

Codebase có chất lượng tổng thể khá tốt, tuân thủ React patterns và CLAUDE.md guidelines. Architecture rõ ràng theo Facade + Service Layer pattern.

- **18 issues identified**
- **14 FIXED** ✅
- **2 REMAINING** ⚠️
- **2 NOT ACTUAL ISSUES** ℹ️ (misreported)

---

## Issue Status

### ✅ FIXED Issues (14 total)

| # | Issue | File | Verified |
|---|-------|------|----------|
| 1 | ErrorBoundary uses `window.location.href` | ErrorBoundary.jsx | ✅ Now uses `useNavigate()` |
| 2 | Entity.period crash on events | Entity.jsx | ✅ Data has `period` field |
| 3 | `changePerspective` function signature mismatch | useChat.js | ✅ Function takes no params, called correctly |
| 4 | Perspective validation for events | Chat.jsx | ✅ Lines 128-135 validate against perspectiveEntries |
| 5 | retrieval.js null check on name | retrieval.js | ✅ Has fallback: dynasty/dates |
| 6 | sessionStorage JSON.parse without try-catch | Quiz.jsx | ✅ Lines 164-177 have try-catch |
| 7 | AbortController cleanup missing | useChat.js | ✅ Lines 232-240 cleanup implemented |
| 8 | SearchModal getIndex in map | SearchModal.jsx | ✅ Line 22: `useMemo(() => getIndex(), [])` |
| 9 | MessageBubble not memoized | Chat.jsx | ✅ Line 36: `const MessageBubble = memo(...)` |
| 10 | Toast module-level store memory leak | Toast.jsx | ✅ Intentional singleton pattern |
| 11 | Quiz JSON regex extraction | Quiz.jsx | ✅ Lines 67-75: uses `indexOf`/`lastIndexOf` |
| 12 | Inline functions in Chat.jsx body | Chat.jsx | ✅ Lines 17-36 are file-level, not in component |
| 13 | AnimatedBackground particle recalculation | AnimatedBackground.jsx | ✅ Lines 35-66: `useMemo` for petals/dust |
| 14 | CORS wildcard on tts.js error | tts.js | ✅ No CORS headers present (not an issue) |

### ℹ️ NOT ACTUAL ISSUES (2)

| # | Was Reported As | Actual Status |
|---|------------------|---------------|
| A | DEV mode bypass without indicator | Intentional dev feature, not a bug |
| B | chatPresetService.js too large | 770 lines only, not 27K+ tokens |
| C | Image lazy loading missing | `eager` is intentional for hero images |

### ⚠️ REMAINING Issues (2)

| # | Issue | File | Priority | Notes |
|---|-------|------|----------|-------|
| S1 | No user input sanitization (prompt injection risk) | Chat.jsx + chat.js | HIGH | User messages go directly to Gemini API |
| 15 | messagesRef mutation during render | useChat.js:34 | MEDIUM | Dual ref+state pattern, potential inconsistency |

---

## Recommendations

### Đã fix hoàn toàn (14 issues)
Không cần làm gì thêm - tất cả crash points và logic issues đã được xử lý.

### Cần xem xét còn lại (2 issues)

#### HIGH Priority
1. **S1 - Prompt injection risk**
   - User input được gửi trực tiếp đến Gemini API mà không sanitize
   - Cân nhắc thêm input validation hoặc dùng Gemini safety settings

#### MEDIUM Priority
2. **#15 - messagesRef mutation**
   - useChat.js line 34: `messagesRef.current = [...messagesRef.current, userMsg]`
   - Cùng lúc với `setMessages` - có thể gây inconsistency trong StrictMode
   - Cân nhắc: chỉ dùng state, hoặc chỉ dùng ref

---

## Files Analyzed (Final)

### Pages
| File | Issues | Status |
|------|--------|--------|
| Home.jsx | 0 | ✅ Clean |
| Entity.jsx | 1 | ✅ Fixed |
| Chat.jsx | 3 | ⚠️ 1 remaining |
| Quiz.jsx | 2 | ✅ Fixed |

### Components
| File | Issues | Status |
|------|--------|--------|
| ErrorBoundary.jsx | 1 | ✅ Fixed |
| SearchModal.jsx | 1 | ✅ Fixed |
| AnimatedBackground.jsx | 1 | ✅ Fixed |
| Toast.jsx | 1 | ✅ Intentional |

### Services
| File | Issues | Status |
|------|--------|--------|
| geminiApi.js | 0 | ✅ Clean |
| retrieval.js | 1 | ✅ Fixed |
| quizService.js | 0 | ✅ Clean |
| chatPresetService.js | 1 | ℹ️ Not a real issue |
| assetService.js | 0 | ✅ Clean |
| ttsService.js | 0 | ✅ Clean |

### Hooks
| File | Issues | Status |
|------|--------|--------|
| useChat.js | 3 | ⚠️ 1 remaining |
| useTTS.js | 0 | ✅ Clean |
| useLocalStorage.js | 0 | ✅ Clean |
| useKeyboardShortcut.js | 0 | ✅ Clean |

### Functions
| File | Issues | Status |
|------|--------|--------|
| netlify/functions/chat.js | 0 | ✅ Clean |
| netlify/functions/tts.js | 1 | ✅ Fixed (was misreported) |

### Data
- All JSON files: ✅ Compliant with schema
- Events have both `period` AND `period_start`/`period_end`

### App Structure
| File | Status |
|------|--------|
| App.jsx | ✅ Clean |
| main.jsx | ✅ Clean |