# wattefakueat 🍽️

Voice-first food tracker PWA. Say what you ate, review the parsed result, save it. Helps identify trigger foods over time.

## Features

- **Voice input** — One tap starts recording with a glowing gold orb. Live captions appear as you speak. Tap to stop and parse.
- **NLP parsing** — Extracts meal type (breakfast/lunch/dinner/snack) and individual foods from natural speech. Handles varied grammar and non-native English.
- **Inline editing** — Review the parsed result: tap a food chip to rename it, tap the meal emoji to switch meal type. Confirm with one tap.
- **Timeline** — Daily grouped entries with glass cards. Search filters inline.
- **Entry management** — Kebab menu (⋮) on each card: Edit (meal type, add/rename/remove foods) or Delete (with confirmation modal).
- **Allergen watchlist** — Full CRUD: add foods, rename inline, delete from a kebab menu. Flagged foods get a warning indicator.
- **Search** — Inline on the home screen. Filters the timeline as you type.
- **Data management** — Export/import your SQLite database. Clear all data with confirmation. Import shows progress + summary.
- **Local-first** — All data stored in your browser via SQLite (WASM) + IndexedDB. No account, no server.
- **PWA** — Installable on your phone home screen. Works offline. Service worker caches app + data.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Output goes to `build/`. Serve with any static file server.

```bash
npm run preview
```

## Usage

1. Tap the **gold mic button** (center bottom)
2. The **orb glows** and starts recording — speak what you ate
3. **Live captions** scroll as you speak
4. Tap the backdrop to stop — NLP extracts meal + foods
5. **Review the result**: tap foods to rename, tap ✕ to remove, tap the meal emoji to change meal type
6. Tap **✓** to save — brief TTS confirms
7. **Cancel anytime** via the X button in the top-left

## Tech stack

| | |
|---|---|
| **Framework** | Svelte 5 + SvelteKit |
| **Typography** | Instrument Sans (body), Jersey 10 Charted (brand) |
| **Database** | sql.js (SQLite via WASM) |
| **Storage** | IndexedDB (persistence) |
| **Voice** | Web Speech API (STT + TTS) |
| **NLP** | Custom keyword + regex parser |
| **CSS** | Tailwind CSS v4 |
| **PWA** | vite-plugin-pwa + Workbox |
| **Colors** | OKLCH warm charcoal + gold |

## Project structure

```
src/
├── lib/
│   ├── components/     # GlowingOrb, VoiceInput, Timeline, EntryCard,
│   │                   # EditEntry, ConfirmModal, EmptyState, BottomNav
│   ├── db/             # SQLite init, IndexedDB storage, CRUD queries
│   ├── nlp/            # Food text parser
│   └── voice/          # STT + TTS utilities
├── routes/             # Home (with inline search), Allergens, Settings
├── app.html
└── app.css             # Tailwind theme + color tokens
```

## Data

All data stays in your browser. Export your SQLite database from Settings > Export.

The database auto-initializes on first use — nothing to set up.
