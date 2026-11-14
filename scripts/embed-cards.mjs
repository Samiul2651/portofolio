// Step 3: turn every knowledge card into vectors, once, at build time.
//
// For each card we embed several texts: the answer itself and each example question.
// At query time a card's meaning score is the best match among its vectors, so a
// visitor's question only needs to resemble ONE of them.
//
// Output: public/vectors.json (generated, not committed).
// Run: npm run embed  (needs internet the first time to download the model)

import { readFile, writeFile } from 'node:fs/promises';
import { pipeline } from '@huggingface/transformers';

// The browser must use the exact same model and dtype, or the vectors won't line up.
export const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
export const DTYPE = 'q8';

const CARDS_PATH = new URL('../src/data/cards.json', import.meta.url);
// Served from public/ so the browser fetches it only when the chat opens.
const OUT_PATH = new URL('../public/vectors.json', import.meta.url);

// 4 decimals keeps the file small with no visible change in scores.
const round = (v) => Math.round(v * 1e4) / 1e4;

const cards = JSON.parse(await readFile(CARDS_PATH, 'utf8'));
const embed = await pipeline('feature-extraction', MODEL_ID, { dtype: DTYPE });

const out = { model: MODEL_ID, dtype: DTYPE, dims: 0, cards: [] };

for (const card of cards) {
  const texts = [`${card.title}. ${card.answer}`, ...card.questions];
  const tensor = await embed(texts, { pooling: 'mean', normalize: true });
  const rows = tensor.tolist().map((row) => row.map(round));
  out.dims = rows[0].length;
  out.cards.push({ id: card.id, vectors: rows });
}

await writeFile(OUT_PATH, JSON.stringify(out));
const total = out.cards.reduce((n, c) => n + c.vectors.length, 0);
console.log(`Embedded ${cards.length} cards into ${total} vectors of ${out.dims} dims → public/vectors.json`);
