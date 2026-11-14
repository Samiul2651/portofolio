// Pure ranking logic: combine meaning and keyword scores, decide if we can answer.
// No model here, so it can be unit-tested anywhere.

import { buildBm25, bm25Scores, type Bm25Index } from './keywords';

export interface Card {
  id: string;
  category: string;
  title: string;
  answer: string;
  questions: string[];
}

export interface CardVectors {
  id: string;
  vectors: number[][];
}

export interface Ranked {
  card: Card;
  score: number; // final, 0..1-ish
  meaning: number; // best cosine among the card's vectors
  keywords: number; // BM25 scaled so the best card = 1
}

// Weights and cut-off. Step 5's test set tunes these.
export const MEANING_WEIGHT = 0.75;
export const KEYWORD_WEIGHT = 0.25;
export const ANSWER_THRESHOLD = 0.42;

export interface RankIndex {
  cards: Card[];
  vectors: number[][][]; // per card, aligned with cards
  bm25: Bm25Index;
}

export function buildRankIndex(cards: Card[], cardVectors: CardVectors[]): RankIndex {
  const byId = new Map(cardVectors.map((c) => [c.id, c.vectors]));
  const kept = cards.filter((c) => byId.has(c.id));
  return {
    cards: kept,
    vectors: kept.map((c) => byId.get(c.id)!),
    bm25: buildBm25(kept.map((c) => `${c.title} ${c.answer} ${c.questions.join(' ')}`)),
  };
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** queryVector must be normalized (same as the card vectors), so dot = cosine. */
export function rank(index: RankIndex, query: string, queryVector: number[]): Ranked[] {
  const kw = bm25Scores(index.bm25, query);
  const kwMax = Math.max(...kw, 1e-9);
  return index.cards
    .map((card, i) => {
      const meaning = Math.max(...index.vectors[i].map((v) => dot(v, queryVector)));
      const keywords = kw[i] / kwMax;
      return { card, meaning, keywords, score: MEANING_WEIGHT * meaning + KEYWORD_WEIGHT * keywords };
    })
    .sort((a, b) => b.score - a.score);
}

export function canAnswer(top: Ranked | undefined): boolean {
  return !!top && top.score >= ANSWER_THRESHOLD;
}
