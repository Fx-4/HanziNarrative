# Frontend — Claude Context

> Extends root CLAUDE.md. Loaded automatically for tasks inside `frontend/`.

## Conventions
- Functional components + hooks only — no class components
- Strict TypeScript, no `any` (exception: SSE stream edge cases, wajib comment alasannya)
- Path alias `@/` → `src/`  (contoh: `import { learningApi } from '@/services/api'`)
- Semua styling via Tailwind — gunakan token custom dari `tailwind.config.js`
- Animasi: Framer Motion, reuse wrapper dari `components/animations/` (FadeIn, CountUp, dll)
- SSE streams: gunakan `fetch` langsung + `pumpSSE()` helper, bukan Axios
- AI generation endpoints: set Axios timeout `0` (disabled)

## Routing (React Router v6)
Protected routes semua di bawah `/` → requires auth + onboarding selesai.

| Route | Page | Notes |
|---|---|---|
| `/dashboard` | Dashboard | Stats + charts (label nav: "Stats") |
| `/review` | Review | SRS spaced repetition — primary nav |
| `/path` | LearningPath | Kursus HSK — primary nav |
| `/stories` | Stories | AI stories — primary nav |
| `/flashcards` | Flashcards | Practice dropdown |
| `/practice` | — | **Dihapus** — jangan buat ulang |

## Auth Flow
- JWT access (30 min) + refresh (30 days) → `localStorage` key `access_token` / `refresh_token`
- `authStore` (Zustand) persist ke `localStorage` key `auth-storage`
- Axios interceptor: 401 → auto-refresh → retry; gagal → logout + redirect `/login`
- Post-login: cek `onboarding_completed` → redirect `/onboarding` jika belum

## API Client Pattern (`src/services/api.ts`)
```ts
// Tambah endpoint baru: kelompok per domain
export const xyzApi = {
  getXyz: () => api.get<ResponseType>('/xyz/endpoint').then(r => r.data),
  postXyz: (body: Body) => api.post('/xyz/endpoint', body).then(r => r.data),
}
```

## Design Tokens
| Token | Hex | Kegunaan |
|---|---|---|
| `primary-600` | `#4f46e5` | Tombol utama, link, aksen |
| `accent-500` | `#f59e0b` | Badge, highlight, nuansa Tionghoa |
| `success-600` | `#16a34a` | Mastered, correct, selesai |
| `error-600` | `#dc2626` | Wrong, danger, error |
| `surface-card` | dark bg | Card background dark mode |

Fonts: `Inter` (UI) · `Noto Sans SC` (karakter Han, class `font-chinese`) · `JetBrains Mono` (pinyin)

## Component Classes (`src/index.css`)
`.btn-primary` `.btn-secondary` `.card` `.glass`
`.badge-*` `.alert-*`
`.hanzi-xl` `.hanzi-md` `.hanzi-sm` `.pinyin`
`.learn-card` `.exercise-option`

## State Management
| Store | File | Isi |
|---|---|---|
| `authStore` | `store/authStore.ts` | user, isAuthenticated, tokens, login/logout |
| `themeStore` | `store/themeStore.ts` | isDarkMode, toggleDarkMode |
