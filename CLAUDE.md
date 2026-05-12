# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**HistoryLens AI** is an educational Vietnamese history web application featuring:
- Entity profiles (historical figures & events)
- Multi-perspective AI chat (RAG-based)
- Interactive quizzes
- Learning paths
- Immersive "ancient scroll" East Asian design aesthetic

**Tech Stack:** React 19 + Vite 8 + Tailwind CSS v4 + Netlify Functions (Gemini 2.5 Flash)

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- (Optional) Netlify CLI for local function testing

### Installation
```bash
npm install
```

### Development
```bash
# Start Vite dev server (frontend only)
npm run dev
# → http://localhost:5173

# Start Netlify Functions locally (in separate terminal)
netlify dev
# → http://localhost:8888
```

### Build & Preview
```bash
npm run build          # Production build to dist/
npm run preview       # Preview production build
```

### Testing
```bash
npm test              # Run all tests once
npm test -- --watch   # Watch mode (vitest)
```

**Test files location:** `src/__tests__/*.test.js`

---

## Architecture Overview

### Data Layer (`src/services/retrieval.js`)
Central module that:
- Loads entity data from `src/data/entities/*.json` and `src/data/events/*.json`
- Normalizes entities via `normalizeEntity()` (fallback fields, mojibake repair)
- Exposes: `getEntity(id)`, `getAllEntities()`, `searchEntities(query)`, `getIndex()`
- Handles timeline/period mapping

**Entity JSON Structure:**
```json
{
  "id": "le-loi",
  "type": "person",
  "name": "Lê Lợi",
  "aliases": ["Lê Thái Tổ"],
  "period": "Hậu Lê sơ",
  "tags": ["vua", "khởi nghĩa"],
  "short_desc": "Brief description",
  "timeline": [{ "year": 1418, "event": "Phất cờ khởi nghĩa" }],
  "perspectives": {
    "self": { "persona": "...", "system_prompt": "..." },
    "contemporary": { ... },
    "historian": { ... }
  },
  "chunks": [
    { "id": "ll-001", "content": "...", "source": "...", "reliability": 92, "tags": [] }
  ],
  "related_people": ["nguyen-trai"],
  "related_events": ["khoi-nghia-lam-son"]
}
```

### Multi-Perspective System
- **Perspectives** define how the AI portrays the entity: `self`, `contemporary`, `historian`
- Perspective-specific character images via `PERSPECTIVE_CHARACTER_PATHS` in `assetService.js`
- Chat hook (`useChat.js`) switches perspectives, clearing message history
- Backend (`netlify/functions/chat.js`) injects the perspective's `system_prompt` + entity `chunks` into Gemini

### Backend (Netlify Functions)
**Entry point:** `netlify/functions/chat.js`

**Modes:**
- `chat`: Streaming RAG chat with entity context
- `quiz`: Generate 5 multiple-choice questions from entity data

**Security:** Prompt injection sanitization (`sanitizeUserInput`), safety settings, environment variable `GEMINI_API_KEY` required.

### Assets & Styling
**Asset mapping** (`src/services/assetService.js`):
- `ENTITY_CHARACTER_PATHS` - default character per entity/event
- `PERSPECTIVE_CHARACTER_PATHS` - overrides per perspective
- `getBackgroundUrl(entityId)` - themed backgrounds (fallback gradients if image missing)

**CSS Vibe:**
- Variables in `src/index.css`: `--clr-paper`, `--clr-ink`, `--clr-vermillion`, `--clr-gold`, `--clr-jade`
- `.character-blend` - mix-blend-mode for seamless character integration
- `.glass-panel` - frosted glass effect
- Fonts: `Playfair Display` (Vietnamese-compatible display), `Be Vietnam Pro`

---

## Key Conventions

### Entity & Data
1. **Always use `normalizeEntity()`** when reading entities to ensure fallback fields
2. **Update `ENTITY_CHARACTER_PATHS`** when adding new entities/events to set default character image
3. **Update `PERSPECTIVE_CHARACTER_PATHS`** for perspective-specific character variations (e.g., `dien-bien-phu:french`)
4. **Add manifest entry** in `src/data/manifest.json` for new entities (status: pending/verified)

### API & Chat
- **Never call Gemini directly from frontend** - always use `/.netlify/functions/chat`
- Streaming handled via `useChat` hook with RAF throttling
- Preset responses (`chatPresetService.js`) provide pre-written answers with audio; priority over AI

### Testing
- Tests use **Vitest** (Jest-compatible API)
- Place tests in `src/__tests__/` matching source structure
- Run single test: `npm test -- MyTestFile`
- Core modules to cover: `retrieval.js`, `chatPresetService.js`, `quizService.js`

---

## Common Tasks

### Adding a New Historical Figure
1. Create JSON in `src/data/entities/<slug>.json` with required fields
2. Add entry to `src/data/manifest.json`
3. (Optional) Add character image to `public/assets/characters/`
4. Update `ENTITY_CHARACTER_PATHS` in `assetService.js`
5. Add perspective configurations if needed
6. Add `chunks` with source material for RAG
7. Run tests: `npm test`

### Adding a New Event (Battle, Period)
Similar to figure, but place in `src/data/events/`
- Events may have multiple perspectives for opposing sides (e.g., `viet-minh`, `french`)
- Update `PERSPECTIVE_CHARACTER_PATHS` for each perspective

### Modifying Chat Behavior
- **Preset responses:** Edit `src/services/chatPresetService.js` (catalog + matching logic)
- **System prompts:** Edit `perspectives[].system_prompt` in entity JSON
- **RAG chunks:** Add/update `chunks` array in entity JSON

### Styling
- Use Tailwind utilities for layout/spacing
- Use CSS variables for colors: `var(--clr-*)`
- Avoid arbitrary font choices - use `Playfair Display` or `Be Vietnam Pro`

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | Netlify (Production) / `.env` (local with netlify dev) | Gemini API access |
| `VITE_NETLIFY` | Frontend build | Set to enable live Netlify Function calls |

**Local dev with functions:** Netlify CLI reads from `.env`. Set `GEMINI_API_KEY` there.

---

## Deployment (Netlify)

1. Push to Git (main branch)
2. Connect repository to Netlify
3. Set environment variable `GEMINI_API_KEY` in Netlify dashboard
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Functions directory: `netlify/functions`

**netlify.toml** is already configured with SPA routing.

---

## Important Notes

- **Font compatibility:** Never use `Cinzel` or fonts without full Vietnamese diacritic support. `Playfair Display` is the standard.
- **RAG integrity:** The AI only knows what's in `chunks`. Never expect it to hallucinate unsupported facts.
- **Character images:** Must be PNG/WEBP with light/transparent background for `.character-blend` to work.
- **Admin dashboard:** Exists at `/admin` - review entity status, verification, and content completeness.
- **PWA:** `public/manifest.json` configured - ensure icons exist before enabling install prompt.

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm test` | Run Vitest test suite |
| `node scripts/generate-entity.js` | Scaffold new entity with boilerplate |
| `netlify dev` | Run Netlify Functions + dev server together |

---

## Repository Structure (High Level)

```
├── netlify/functions/
│   └── chat.js           # Gemini API wrapper (chat + quiz modes)
├── public/               # Static assets (favicon, manifest, images)
├── scripts/              # Utility scripts (entity generation, sitemap)
├── src/
│   ├── components/       # Reusable UI (SearchModal, Toast, ErrorBoundary)
│   ├── data/
│   │   ├── entities/     # Full entity JSON (persons)
│   │   ├── events/       # Full entity JSON (events)
│   │   ├── manifest.json # Entity registry & metadata
│   │   └── timeline.js   # Period definitions
│   ├── hooks/            # Custom React hooks (useChat, useTTS, etc.)
│   ├── pages/            # Route components (Home, Entity, Chat, Quiz...)
│   ├── services/         # Business logic (retrieval, assetService, geminiApi)
│   ├── __tests__/        # Vitest test files
│   ├── App.jsx           # Router + layout
│   └── main.jsx          # Entry point
├── CLAUDE.md             # This file
├── netlify.toml          # Netlify configuration
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind CSS config
```

---

## Data Flow: Chat Request

1. User sends message in `Chat.jsx` → `useChat.sendMessage()`
2. `useChat` calls `/.netlify/functions/chat` with `{ entityId, perspective, messages }`
3. `chat.js` loads entity from manifest, builds system prompt:
   - Entity info (name, period, short_desc)
   - Perspective config (persona, voice_name, system_prompt)
   - All `chunks` as reference material
4. Gemini 2.5 Flash generates response (streamed SSE)
5. `useChat` streams chunks to UI, throttles renders via `requestAnimationFrame`
6. Follow-up suggestions extracted from AI response + preset catalog

---

## Design System (Vibe)

**East Asian "Ancient Scroll" Aesthetic:**
- **Colors:** Warm paper (`#f5f0e6`), ink black (`#1a1714`), vermillion (`#c62e34`), gold (`#d4a843`), jade (`#2a9c8f`)
- **Textures:** Subtle grain overlays via CSS `::before` with noise image
- **Depth:** Background layers, glass panels with blur, character blend modes
- **Typography:** `Playfair Display` for headings (serif, elegant), `Be Vietnam Pro` for body

**Component Patterns:**
- `.glass-panel` - `background: rgba(255,248,240,0.7); backdrop-filter: blur(12px);`
- `.character-blend` - `mix-blend-mode: multiply;` (for PNGs on varied backgrounds)
- `.display` - large heading style with tracking
- `.scroll-content` - centered max-width container with padding

---

## Git Workflow

- **Main branch:** `main`
- **Feature work:** Create descriptive branch names (`feat/add-entity-le-thanh-tong`)
- **Commits:** Conventional Commits style (Claude will generate via `git-commit` agent)
- **PRs:** Use GitHub PRs; run full test suite before requesting review

---

## Testing Strategy

- **Unit tests:** `vitest` for services (`retrieval`, `chatPresetService`, `quizService`)
- **Integration:** Test entity normalization, search, index generation
- **Edge cases:** Diacritic-insensitive search, mojibake repair, null handling
- **Test coverage goal:** >80% for service layer

---

## When Modifying Code

### Before adding new features:
- Check if existing patterns in `retrieval.js` or `assetService.js` cover the need
- Don't invent new entity fields unless absolutely necessary
- Maintain backward compatibility with existing entity JSON structure

### When fixing bugs:
- Write a test that reproduces the bug first (TDD approach)
- Check `useChat` cleanup logic for race conditions (abortController, RAF)
- Verify Gemini safety settings aren't blocking legitimate content

### When refactoring:
- Keep entity JSON structure stable
- Preserve the manifest-driven entity loading pattern
- Don't move data out of JSON files into code - entities are content, not logic

---

## Security Considerations

- **API keys:** Only in Netlify environment variables. Never commit `.env` (already in `.gitignore`)
- **Prompt injection:** Sanitized in `chat.js` - extend `INJECTION_PATTERNS` if needed
- **XSS:** React's default escaping handles most cases. If using `dangerouslySetInnerHTML` (no current use), sanitize first.
- **CORS:** Netlify Functions handle CORS automatically for same-origin requests.

---

## Resources

- **Gemini API:** https://ai.google.dev/gemini-api/docs
- **Netlify Functions:** https://docs.netlify.com/functions/overview/
- **Vitest:** https://vitest.dev/
- **React 19 Docs:** https://react.dev/

---

*Generated from codebase analysis. Last updated: 2026-05-12*
