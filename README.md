# Ask Samiul

My portfolio site, with a chatbot that answers questions about me. It runs fully in the browser: no LLM, no server, zero cost.

Live: https://samiul2651.github.io/portofolio/

## How the chatbot works

1. I write short "knowledge cards" about my work, projects and skills.
2. At build time, a script turns each card into a vector (MiniLM embeddings).
3. In the browser, Transformers.js turns the visitor's question into a vector.
4. Each card gets a score that mixes meaning match (cosine similarity) and keyword match (BM25). The best card is the answer.
5. If no card scores high enough, the bot says it doesn't know and points to my email.

A "Show retrieval" toggle shows the top cards and their scores.

## Run locally

```bash
npm install
npm run dev
```

## Folders

- `src/` — site and chat UI
- `src/chat/` — retrieval engine (step 4)
- `src/data/` — knowledge cards and precomputed vectors (steps 2–3)
- `scripts/` — build-time scripts, such as the card embedder
- `tests/` — retrieval test set (step 5)

## Deploy

Every push to `main` builds the site and deploys it to GitHub Pages (`.github/workflows/deploy.yml`).
