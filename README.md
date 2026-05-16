# Freello

> Tell Freello your goal — get a ready-to-roll Kanban back, complete with GIFs.

A tiny single-page Kanban app:

1. **Setup wizard** asks for your objective and (optionally) any extra info you want to keep in mind.
2. **OpenRouter** drafts 6–10 tasks distributed across **Backlog · To Do · Doing · Done**.
3. **Giphy** is queried for a vibe-matching GIF per task; the URL is embedded directly — no downloads.
4. Drag, edit, and add cards. Everything persists in `localStorage` on your machine.

## Run it

```bash
npm install
cp .env.example .env   # add your OpenRouter / Giphy keys (or paste them in the wizard)
npm run dev
```

Open http://localhost:5173.

## API keys

You can provide keys two ways — both are stored only in your browser:

- **`.env`** at the project root (read at build time):
  ```
  VITE_OPENROUTER_KEY=sk-or-...
  VITE_OPENROUTER_MODEL=openai/gpt-4o-mini
  VITE_GIPHY_KEY=...
  ```
- **In the wizard** (or the in-app Settings panel later).

OpenRouter key: <https://openrouter.ai/keys> · Giphy key: <https://developers.giphy.com>

The Giphy key is optional — cards just won't get a GIF without it.

## How GIFs work

Freello calls Giphy's Search API, then puts the returned CDN URL straight into `<img src>`. Giphy hosts the bytes; the app never downloads or re-uploads anything. Each board footer credits **Powered by GIPHY**.
